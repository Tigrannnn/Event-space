import * as dotenv from 'dotenv';
import { join } from 'path';
import { expand } from 'dotenv-expand';
import { EnvKey } from '@event-space/shared';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ZodExceptionFilter } from './shared';
import { generateOpenApiComponents } from '@infra/swagger/swagger.registry';

const myEnv = dotenv.config({ path: join(process.cwd(), '../../.env') });
expand(myEnv);

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	app.use(cookieParser());
	app.useGlobalFilters(new ZodExceptionFilter());
	app.getHttpAdapter().getInstance().set('trust proxy', true);

	const origins = configService.get<string[]>(EnvKey.ALLOWED_ORIGINS);

	app.enableCors({
		origin: origins,
		credentials: true,
	});

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

	const port = configService.get<number>(EnvKey.API_PORT) ?? 5000;
	await app.listen(port);

	console.log(`🚀 Server is running on: http://localhost:${port}`);
}
bootstrap();
