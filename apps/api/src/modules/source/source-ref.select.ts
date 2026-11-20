import type { Prisma } from '@prisma/client';

export const SOURCE_REF = {
	select: { id: true, code: true, name: true, kind: true },
} satisfies Prisma.SourceDefaultArgs;
