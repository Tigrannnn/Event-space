import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { RateLimiterModule } from './infrastructure/rate-limiter/rate-limiter.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EventModule } from '@modules/event/event.module';
import { UserModule } from '@modules/user/user.module';
import { MailModule } from './infrastructure/mail/mail.module';
import { AppController } from './app.controller';
import { BookingModule } from '@modules/booking/booking.module';
import { UploadModule } from '@infra/upload/upload.module';
import { AdminModule } from '@modules/admin/admin.module';

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
		BookingModule,
		AdminModule,
	],
	controllers: [AppController],
})
export class AppModule {}
