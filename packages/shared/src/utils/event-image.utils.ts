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

export function getEventImageUrl(image: EventImageLike | undefined): string | undefined {
	if (!image) return undefined;
	return typeof image === 'string' ? image : image.url;
}

export function getEventCoverImageUrl(event: { images?: EventImageLike[] }): string | undefined {
	return getEventImageUrl(sortEventImages(event.images)[0]);
}

export function getEventImageUrls(images: EventImageLike[] | undefined): string[] {
	return sortEventImages(images)
		.map((img) => getEventImageUrl(img))
		.filter((url): url is string => Boolean(url));
}
