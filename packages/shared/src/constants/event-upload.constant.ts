export type EventMutationRateLimitAction = 'create' | 'update';

/**
 * Timeouts for POST/PUT /events with multipart images.
 * Worst case: ~26 MiB client upload + 5 sequential Cloudinary uploads on slow links.
 * Keep nginx values in infra/nginx/api-proxy.conf in sync.
 */
export const EVENT_UPLOAD_TIMEOUTS = {
	/** Client → nginx: receiving multipart body (seconds). */
	NGINX_CLIENT_BODY_SEC: 300,
	/** nginx ↔ Nest: full round-trip including Cloudinary (seconds). */
	NGINX_PROXY_SEC: 600,
	/** Nest HTTP server socket / request timeout (ms). */
	HTTP_SERVER_MS: 600_000,
	/** Browser axios timeout for create/update event (ms). */
	CLIENT_MUTATION_MS: 600_000,
} as const;

/** nginx time directives derived from EVENT_UPLOAD_TIMEOUTS. */
export const EVENT_UPLOAD_TIMEOUTS_NGINX = {
	CLIENT_BODY: `${EVENT_UPLOAD_TIMEOUTS.NGINX_CLIENT_BODY_SEC}s`,
	PROXY: `${EVENT_UPLOAD_TIMEOUTS.NGINX_PROXY_SEC}s`,
} as const;

/** Rate limits for admin event create/update with image uploads. */
export const EVENT_UPLOAD_CONFIG = {
	KEY_PREFIX: 'events:mutation',
	RATE_LIMITS: {
		CREATE: {
			/** Max POST /events per admin user per window. */
			MAX_PER_USER: 10,
			/** Max POST /events per IP per window (stolen-token / shared-network safety). */
			MAX_PER_IP: 15,
			WINDOW_SEC: 60 * 60,
		},
		UPDATE: {
			/** Max PUT /events/:id per admin user per window. */
			MAX_PER_USER: 30,
			/** Max PUT /events/:id per IP per window. */
			MAX_PER_IP: 40,
			WINDOW_SEC: 60 * 60,
		},
	},
} as const;
