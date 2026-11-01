import type { Prisma } from '@prisma/client';

/** What a page may know of a photo: where it is, never how it is stored. */
export const REVIEW_IMAGES = {
	orderBy: { order: 'asc' },
	select: { id: true, url: true, order: true },
} satisfies Prisma.Review$imagesArgs;
