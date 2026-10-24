import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import { RedisService } from '@infra/redis/redis.service';
import { BANNER_CACHE_KEY, BANNER_CACHE_TTL_SEC, BANNER_LIMITS } from '@event-space/shared';
import { BANNER_INCLUDE, type BannerWithTargets } from './banner.constants';
import { activeBannersWhere } from './banner-filters';

@Injectable()
export class BannerService {
	private readonly logger = new Logger(BannerService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService,
	) {}

	async findActive(): Promise<BannerWithTargets[]> {
		const cached = await this.readCache();
		if (cached) {
			return cached;
		}

		const now = new Date();

		const banners = await this.prisma.banner.findMany({
			where: activeBannersWhere(now),
			include: BANNER_INCLUDE,
			orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
			take: BANNER_LIMITS.MAX_ACTIVE,
		});

		await this.writeCache(banners);

		return banners;
	}

	async invalidateCache(): Promise<void> {
		try {
			await this.redis.del(BANNER_CACHE_KEY);
		} catch (error) {
			this.logger.warn('Could not drop the banner cache', error);
		}
	}

	private async readCache(): Promise<BannerWithTargets[] | null> {
		try {
			const cached = await this.redis.get(BANNER_CACHE_KEY);
			return cached ? (JSON.parse(cached) as BannerWithTargets[]) : null;
		} catch (error) {
			// A banner is decoration: a Redis outage must not take the home page with it.
			this.logger.warn('Could not read the banner cache', error);
			return null;
		}
	}

	private async writeCache(banners: BannerWithTargets[]): Promise<void> {
		try {
			await this.redis.set(BANNER_CACHE_KEY, JSON.stringify(banners), BANNER_CACHE_TTL_SEC);
		} catch (error) {
			this.logger.warn('Could not write the banner cache', error);
		}
	}
}
