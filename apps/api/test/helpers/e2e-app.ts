import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@infra/prisma/prisma.service';
import { RedisService } from '@infra/redis/redis.service';
import { ZodExceptionFilter } from '@shared';
import { flushTestRedis } from './flush-redis';
import { resetDatabase } from './reset-db';

export interface E2eContext {
	app: INestApplication;
	prisma: PrismaService;
	redis: RedisService;
	httpServer: ReturnType<INestApplication['getHttpServer']>;
}

export async function createE2eApp(): Promise<E2eContext> {
	await flushTestRedis();

	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	const app = moduleFixture.createNestApplication();
	const prisma = moduleFixture.get(PrismaService);
	const redis = moduleFixture.get(RedisService);

	await resetDatabase(prisma);

	app.use(cookieParser());
	app.useGlobalFilters(new ZodExceptionFilter());
	await app.init();

	return { app, prisma, redis, httpServer: app.getHttpServer() };
}

export async function destroyE2eApp(ctx: E2eContext): Promise<void> {
	await resetDatabase(ctx.prisma);
	await ctx.app.close();
	await flushTestRedis();
}
