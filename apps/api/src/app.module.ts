import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { EnvSchema } from '@event-space/shared';
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
import { StripeModule } from './infrastructure/stripe/stripe.module';
import { CategoryModule } from '@modules/category/category.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [join(__dirname, '../../../.env')],
			expandVariables: true,
			validate: (config) => EnvSchema.parse(config),
		}),
		ScheduleModule.forRoot(),
		PrismaModule,
		UserModule,
		EventModule,
		CategoryModule,
		RedisModule,
		AuthModule,
		RateLimiterModule,
		MailModule,
		UploadModule,
		BookingModule,
		AdminModule,
		StripeModule,
	],
	controllers: [AppController],
})
export class AppModule {}
