/** Maximum number of images per event (single source of truth). */
export const MAX_EVENT_IMAGES = 5;

/** Maximum size per event image file (5 MiB). */
export const MAX_EVENT_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** JSON `payload` field + multipart boundaries (512 KiB). */
export const MAX_EVENT_MULTIPART_PAYLOAD_OVERHEAD_BYTES = 512 * 1024;

/**
 * Upper bound for POST/PUT /events multipart bodies (all files + payload + encoding).
 * Keep nginx `client_max_body_size` in sync (see MAX_EVENT_MULTIPART_BODY_NGINX).
 */
export const MAX_EVENT_MULTIPART_BODY_BYTES =
	MAX_EVENT_IMAGES * MAX_EVENT_IMAGE_FILE_SIZE_BYTES +
	MAX_EVENT_MULTIPART_PAYLOAD_OVERHEAD_BYTES;

/** nginx `client_max_body_size` value derived from MAX_EVENT_MULTIPART_BODY_BYTES. */
export const MAX_EVENT_MULTIPART_BODY_NGINX = `${Math.ceil(
	MAX_EVENT_MULTIPART_BODY_BYTES / (1024 * 1024),
)}m`;
