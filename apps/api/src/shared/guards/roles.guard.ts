import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRoleType } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prisma: PrismaService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<UserRoleType[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredRoles) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest();
		const userId = user?.sub;

		if (!userId) {
			throw new ForbiddenException('You do not have permission to access this resource');
		}

		const dbUser = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		const hasRole = requiredRoles.some((role) => dbUser?.role === role);

		if (!hasRole) {
			throw new ForbiddenException('You do not have permission to access this resource');
		}

		return true;
	}
}
