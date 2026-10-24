/** Maximum size per banner image file (5 MiB). */
export const MAX_BANNER_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Desktop + mobile picture per banner. */
export const MAX_BANNER_IMAGE_FILES = 2;

/** JSON `payload` field + multipart boundaries (512 KiB). */
export const MAX_BANNER_MULTIPART_PAYLOAD_OVERHEAD_BYTES = 512 * 1024;

export const BANNER_LIMITS = {
	TITLE_MAX: 80,
	SUBTITLE_MAX: 160,
	URL_MAX: 1000,
	/** Nobody scrolls past the sixth slide; the cap also keeps the home payload small. */
	MAX_ACTIVE: 10,
} as const;

/** How long the public banner list is served from Redis (seconds). */
export const BANNER_CACHE_TTL_SEC = 5 * 60;

/** Redis key holding the rendered public banner list. */
export const BANNER_CACHE_KEY = 'banners:active';
