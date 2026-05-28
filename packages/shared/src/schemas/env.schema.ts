import { z } from 'zod';
import { EnvKey } from '../enums';

export const EnvSchema = z.object({
	[EnvKey.API_PORT]: z.coerce.number().default(5000),
	[EnvKey.API_URL]: z.url(),
	[EnvKey.NODE_ENV]: z.enum(['development', 'production', 'test']).default('development'),
	[EnvKey.DATABASE_URL]: z.url(),
	[EnvKey.JWT_ACCESS_SECRET]: z.string().min(8),
	[EnvKey.ALLOWED_ORIGINS]: z.string().transform((val) => val.split(',')),
	[EnvKey.FRONTEND_URL]: z.url(),
	[EnvKey.REDIS_URL]: z.string(),
	[EnvKey.GOOGLE_CLIENT_ID]: z.string(),
	[EnvKey.GOOGLE_CLIENT_SECRET]: z.string(),
	[EnvKey.SMTP_HOST]: z.string(),
	[EnvKey.SMTP_PORT]: z.coerce.number(),
	[EnvKey.SMTP_USER]: z.string(),
	[EnvKey.SMTP_PASS]: z.string(),
	[EnvKey.SMTP_FROM]: z.email(),
	[EnvKey.MAIL_DEV_MODE]: z.enum(['true', 'false']).default('false'),
	[EnvKey.CLOUDINARY_CLOUD_NAME]: z.string(),
	[EnvKey.CLOUDINARY_API_KEY]: z.string(),
	[EnvKey.CLOUDINARY_API_SECRET]: z.string(),
	[EnvKey.STRIPE_PUBLISHABLE_KEY]: z.string(),
	[EnvKey.STRIPE_SECRET_KEY]: z.string(),
	[EnvKey.STRIPE_WEBHOOK_SECRET]: z.string(),
});
