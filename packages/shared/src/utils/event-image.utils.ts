/** Event image row from API or legacy string URL. */
export type EventImageLike = string | { url: string; order?: number };

function sortEventImages(images: EventImageLike[] | undefined): EventImageLike[] {
	if (!images?.length) return [];
	const hasOrder = images.every(
		(img) => typeof img === 'object' && img !== null && typeof img.order === 'number',
	);
	if (!hasOrder) return images;
	return [...images].sort((a, b) => {
		const orderA = typeof a === 'object' && a !== null ? (a.order ?? 0) : 0;
		const orderB = typeof b === 'object' && b !== null ? (b.order ?? 0) : 0;
		return orderA - orderB;
	});
}

/**
 * Asks Cloudinary to deliver the picture in the lightest form this particular browser accepts.
 *
 * Uploads are already resized and compressed once, when they are stored, but that bakes in a
 * single format for everyone — in practice JPEG. `f_auto` is the part that can't be decided
 * ahead of time: it hands AVIF or WebP to browsers that take them and JPEG to the rest, which
 * measures 10-30% smaller on the images currently on the site. `q_auto` lets Cloudinary pick the
 * quality per image, and `c_limit,w_1600` is a ceiling that never enlarges anything — a no-op for
 * today's uploads, and a floor under the page size if the upload rules ever loosen.
 *
 * One URL for every use on purpose: the catalogue card, the event page and the full-screen
 * preview all request the same one, so opening the preview shows a picture the browser already
 * holds instead of starting a fresh download.
 */
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';
const CLOUDINARY_DELIVERY = 'f_auto,q_auto,c_limit,w_1600';
/** A path segment like `w_600` or `f_auto,q_80` — a transformation this URL already carries. */
const EXISTING_TRANSFORM = /^[a-z]{1,3}_[^/,]+(,[a-z]{1,3}_[^/,]+)*\//;

export function optimizeImageUrl(url: string): string {
	if (!url.includes('res.cloudinary.com')) return url;

	const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
	if (markerIndex === -1) return url;

	const head = url.slice(0, markerIndex + CLOUDINARY_UPLOAD_MARKER.length);
	const tail = url.slice(markerIndex + CLOUDINARY_UPLOAD_MARKER.length);
	if (EXISTING_TRANSFORM.test(tail)) return url;

	return `${head}${CLOUDINARY_DELIVERY}/${tail}`;
}

export function getEventImageUrl(image: EventImageLike | undefined): string | undefined {
	if (!image) return undefined;
	const url = typeof image === 'string' ? image : image.url;
	return url ? optimizeImageUrl(url) : undefined;
}

export function getEventCoverImageUrl(event: { images?: EventImageLike[] }): string | undefined {
	return getEventImageUrl(sortEventImages(event.images)[0]);
}

export function getEventImageUrls(images: EventImageLike[] | undefined): string[] {
	return sortEventImages(images)
		.map((img) => getEventImageUrl(img))
		.filter((url): url is string => Boolean(url));
}
