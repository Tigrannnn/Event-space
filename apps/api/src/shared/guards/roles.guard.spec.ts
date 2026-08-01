import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppErrorCode } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppException } from '../exceptions/app.exception';
import { RolesGuard } from './roles.guard';

jest.mock('@infra/prisma/prisma.service', () => ({
	PrismaService: class {},
}));

describe('RolesGuard', () => {
	it('uses the latest role from the database instead of the stale token payload', async () => {
		const reflector = new Reflector();
		const prisma = {
			user: {
				findUnique: jest.fn().mockResolvedValue({ role: 'ADMIN' }),
			},
		} as unknown as PrismaService;
		const guard = new RolesGuard(reflector, prisma);

		const context = {
			switchToHttp: () => ({
				getRequest: () => ({
					user: { sub: 'user-1', role: 'USER' },
				}),
			}),
			getHandler: () => ({}),
			getClass: () => class TestController {},
		} as ExecutionContext;

		reflector.getAllAndOverride = jest.fn().mockReturnValue(['ADMIN']);

		await expect(guard.canActivate(context)).resolves.toBe(true);
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { id: 'user-1' },
			select: { role: true },
		});
	});

	it('throws forbidden when the user is not allowed after loading the current role', async () => {
		const reflector = new Reflector();
		const prisma = {
			user: {
				findUnique: jest.fn().mockResolvedValue({ role: 'USER' }),
			},
		} as unknown as PrismaService;
		const guard = new RolesGuard(reflector, prisma);

		const context = {
			switchToHttp: () => ({
				getRequest: () => ({
					user: { sub: 'user-1', role: 'ADMIN' },
				}),
			}),
			getHandler: () => ({}),
			getClass: () => class TestController {},
		} as ExecutionContext;

		reflector.getAllAndOverride = jest.fn().mockReturnValue(['ADMIN']);

		await expect(guard.canActivate(context)).rejects.toMatchObject({
			code: AppErrorCode.INSUFFICIENT_PERMISSIONS,
		});
		await expect(guard.canActivate(context)).rejects.toBeInstanceOf(AppException);
	});

	it('rejects a request that carries no user at all', async () => {
		const reflector = new Reflector();
		const prisma = {
			user: { findUnique: jest.fn() },
		} as unknown as PrismaService;
		const guard = new RolesGuard(reflector, prisma);

		const context = {
			switchToHttp: () => ({ getRequest: () => ({}) }),
			getHandler: () => ({}),
			getClass: () => class TestController {},
		} as ExecutionContext;

		reflector.getAllAndOverride = jest.fn().mockReturnValue(['ADMIN']);

		await expect(guard.canActivate(context)).rejects.toMatchObject({
			code: AppErrorCode.INSUFFICIENT_PERMISSIONS,
		});
		expect(prisma.user.findUnique).not.toHaveBeenCalled();
	});
});
