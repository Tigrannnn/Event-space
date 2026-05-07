import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SafeUserData, UpdateUserData } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getMe(userId: string): Promise<SafeUserData> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) throw new UnauthorizedException('User not found');

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

	async deleteMe(userId: string): Promise<void> {
		await this.prisma.$transaction([
			this.prisma.refreshToken.deleteMany({ where: { userId } }),
			this.prisma.user.delete({ where: { id: userId } }),
		]);
	}
}
