import { z } from 'zod';
import { EnvKey } from '../enums';
import { CLOUDINARY_CONFIG } from '../constants/cloudinary.constant';

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
	// Optional: when set, mail goes out over Resend's HTTP API instead of SMTP,
	// which hosts like Railway block below their paid tiers.
	[EnvKey.RESEND_API_KEY]: z.string().optional(),
	// Optional: widens auth cookies to a parent domain (".example.com") so the
	// front-end host can read them while the API runs on a sibling subdomain.
	[EnvKey.COOKIE_DOMAIN]: z.string().optional(),
	[EnvKey.CLOUDINARY_CLOUD_NAME]: z.string(),
	[EnvKey.CLOUDINARY_API_KEY]: z.string(),
	[EnvKey.CLOUDINARY_API_SECRET]: z.string(),
	// The folder uploads go into, and the only folder this deployment may delete from.
	// Give each environment its own: a local API on the production Cloudinary account
	// would otherwise treat every production image as one of its own.
	[EnvKey.CLOUDINARY_UPLOAD_FOLDER]: z.string().min(1).default(CLOUDINARY_CONFIG.UPLOAD_FOLDER),
	// Orphan reconciliation deletes every asset in the folder that this deployment's
	// database doesn't reference. Opt-in, so a copy pointed at another database can't
	// wipe production images just by starting up.
	[EnvKey.CLOUDINARY_RECONCILE_ORPHANS]: z.enum(['true', 'false']).default('false'),
	[EnvKey.STRIPE_PUBLISHABLE_KEY]: z.string(),
	[EnvKey.STRIPE_SECRET_KEY]: z.string(),
	[EnvKey.STRIPE_WEBHOOK_SECRET]: z.string(),
	[EnvKey.BOOKING_RESERVATION_TTL_SECONDS]: z.coerce.number().default(120),
});
