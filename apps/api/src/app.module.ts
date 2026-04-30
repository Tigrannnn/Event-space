import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RateLimiterModule } from './infrastructure/rate-limiter/rate-limiter.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EventModule } from '@modules/event/event.module';
import { UserModule } from '@modules/user/user.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { AppController } from './app.controller';

import { UploadModule } from '@modules/upload/upload.module';

@Module({
	imports: [
		PrismaModule,
		UserModule,
		EventModule,
		RedisModule,
		AuthModule,
		RateLimiterModule,
		MailModule,
		UploadModule,
	],
	controllers: [AppController],
})
export class AppModule {}
