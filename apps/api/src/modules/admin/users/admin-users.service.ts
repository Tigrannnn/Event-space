import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppErrorCode, isUuid } from '@event-space/shared';
import { AppException } from '@shared';
import type {
	PaginatedParams,
	SafeUserData,
	UpdateShadowUserData,
	UserRoleType,
} from '@event-space/shared';
import { safeUserSelect } from '../common/admin-selects';
import { buildDayRangeFilter, toPage } from '../common/query-helpers';

interface FindAllUsersParams extends PaginatedParams {
	search?: string;
	role?: UserRoleType;
	emailVerified?: boolean;
	createdFrom?: string;
	createdTo?: string;
	isShadow?: boolean;
}

@Injectable()
export class AdminUsersService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll({
		skip = 0,
		limit = 20,
		search,
		role,
		emailVerified,
		createdFrom,
		createdTo,
		isShadow,
	}: FindAllUsersParams = {}) {
		const createdAt = buildDayRangeFilter(createdFrom, createdTo);

		const where = {
			...(search
				? {
						OR: [
							...(isUuid(search) ? [{ id: search }] : []),
							{ name: { contains: search, mode: 'insensitive' as const } },
							{ email: { contains: search, mode: 'insensitive' as const } },
						],
					}
				: {}),
			...(role ? { role } : {}),
			...(typeof emailVerified === 'boolean' ? { emailVerified } : {}),
			...(typeof isShadow === 'boolean' ? { isShadow } : {}),
			...(createdAt ? { createdAt } : {}),
		};

		const [users, total] = await Promise.all([
			this.prisma.user.findMany({
				where,
				skip,
				take: limit + 1,
				orderBy: { createdAt: 'desc' },
				select: safeUserSelect,
			}),
			this.prisma.user.count({ where }),
		]);

		return toPage(users, total, skip, limit);
	}

	findOne(id: string): Promise<SafeUserData | null> {
		return this.prisma.user.findUnique({ where: { id }, select: safeUserSelect });
	}

	async updateRole(adminId: string, id: string, role: UserRoleType): Promise<SafeUserData> {
		if (adminId === id) {
			throw new AppException(AppErrorCode.CANNOT_CHANGE_OWN_ROLE);
		}

		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { emailVerified: true, isShadow: true },
		});

		if (!user) throw new AppException(AppErrorCode.USER_NOT_FOUND, { id });

		if (role === 'ADMIN' && (!user.emailVerified || user.isShadow)) {
			throw new AppException(AppErrorCode.CANNOT_PROMOTE_UNVERIFIED, { id });
		}

		return this.prisma.user.update({
			where: { id },
			data: { role },
			select: safeUserSelect,
		});
	}

	async updateShadow(id: string, data: UpdateShadowUserData): Promise<SafeUserData> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { isShadow: true },
		});

		if (!user) throw new AppException(AppErrorCode.USER_NOT_FOUND, { id });
		if (!user.isShadow) throw new AppException(AppErrorCode.USER_NOT_SHADOW, { id });

		const email = data.email ? data.email.trim().toLowerCase() : null;

		try {
			return await this.prisma.user.update({
				where: { id },
				data: {
					...(data.name === undefined ? {} : { name: data.name }),
					...(data.phone === undefined ? {} : { phone: data.phone }),
					...(data.email === undefined ? {} : { email }),
				},
				select: safeUserSelect,
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				throw new AppException(AppErrorCode.EMAIL_ALREADY_EXISTS, { email: email ?? '' });
			}
			throw error;
		}
	}
}
