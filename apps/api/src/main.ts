import * as dotenv from 'dotenv';
import { join } from 'path';
import { expand } from 'dotenv-expand';
import { EnvKey, EVENT_UPLOAD_TIMEOUTS } from '@event-space/shared';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import express from 'express';
import { ZodExceptionFilter } from './shared';
import { generateOpenApiComponents } from '@infra/swagger/swagger.registry';
import type { Server } from 'http';

const myEnv = dotenv.config({ path: join(process.cwd(), '../../.env') });
expand(myEnv);

function configureHttpUploadTimeouts(server: Server): void {
	const timeoutMs = EVENT_UPLOAD_TIMEOUTS.HTTP_SERVER_MS;
	server.setTimeout(timeoutMs);
	server.requestTimeout = timeoutMs;
	server.headersTimeout = timeoutMs + 5_000;
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
	app.use(cookieParser());
	app.useGlobalFilters(new ZodExceptionFilter());
	app.getHttpAdapter().getInstance().set('trust proxy', true);

	const origins = configService
		.get<string[]>(EnvKey.ALLOWED_ORIGINS)
		?.concat(
			configService.get<string>(EnvKey.FRONTEND_URL) ?? '',
			configService.get<string>(EnvKey.API_URL) ?? '',
		);

	app.enableCors({
		origin: origins,
		credentials: true,
	});

	if (configService.get<string>(EnvKey.NODE_ENV) !== 'production') {
		const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');

		const config = new DocumentBuilder()
			.setTitle('Event Space API')
			.setDescription('API for Event Space - tour and events platform')
			.setVersion('1.0')
			.addBearerAuth()
			.build();

		const document = SwaggerModule.createDocument(app, config);
		const zodSchemas = generateOpenApiComponents();
		if (zodSchemas) {
			document.components = document.components || {};
			document.components.schemas = document.components.schemas || {};

			Object.assign(document.components.schemas, zodSchemas);

			console.log(`[Main] Injected ${Object.keys(zodSchemas).length} Zod schemas into Swagger`);
		}

		SwaggerModule.setup('api', app, document);
	}

	const port = configService.get<number>(EnvKey.API_PORT) ?? 5000;
	const server = await app.listen(port);
	configureHttpUploadTimeouts(server);

	console.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap();
