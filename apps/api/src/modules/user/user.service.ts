import { Injectable } from '@nestjs/common';
import { AppErrorCode, SafeUserData, UpdateUserData } from '@event-space/shared';
import { AppException } from '@shared';
import { PrismaService } from '@infra/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getMe(userId: string): Promise<SafeUserData> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) throw new AppException(AppErrorCode.CURRENT_USER_NOT_FOUND);

		const { passwordHash, ...safeUser } = user;

		return safeUser;
	}

	async updateMe(userId: string, data: UpdateUserData): Promise<SafeUserData> {
		const user = await this.prisma.user.update({
			where: { id: userId },
			data,
		});

		const { passwordHash, ...safeUser } = user;

		return safeUser;
	}
}
