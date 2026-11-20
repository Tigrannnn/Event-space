import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { normalizeSourceRef, type TrackAnalyticsData } from '@event-space/shared';
import { toDateKey } from '../../shared/utils/app-day.util';
import { isBot } from './is-bot';

@Injectable()
export class AnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	async track(
		data: TrackAnalyticsData,
		context: { userAgent?: string; role?: string },
		now: Date = new Date(),
	): Promise<{ recorded: boolean }> {
		if (context.role === 'ADMIN' || isBot(context.userAgent)) return { recorded: false };

		const eventId = data.type === 'VISIT' ? null : (data.eventId ?? null);

		try {
			const { count } = await this.prisma.analyticsEvent.createMany({
				data: [
					{
						type: data.type,
						visitorId: data.visitorId,
						day: toDateKey(now),
						targetKey: eventId ?? '',
						eventId,
						sourceRef: normalizeSourceRef(data.ref),
					},
				],
				skipDuplicates: true,
			});
			return { recorded: count > 0 };
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
				return { recorded: false };
			}
			throw error;
		}
	}
}
