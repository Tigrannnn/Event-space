import { EnvKey } from '@event-space/shared';

export const clientEnv: Partial<Record<EnvKey, string>> = {
	[EnvKey.STRIPE_PUBLISHABLE_KEY]: process.env.STRIPE_PUBLISHABLE_KEY,
	[EnvKey.GOOGLE_CLIENT_ID]: process.env.GOOGLE_CLIENT_ID,
    [EnvKey.FRONTEND_URL]: process.env.FRONTEND_URL,
};