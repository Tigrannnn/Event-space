import type { Prisma } from '@prisma/client';
import { AppErrorCode, normalizeSourceRef } from '@event-space/shared';
import { AppException } from '@shared';

type SourceDb = { source: Prisma.TransactionClient['source'] };

export interface BookingSourceFields {
	sourceId: string | null;
	sourceRef: string | null;
}

export async function resolveSourceRef(
	db: SourceDb,
	raw: string | null | undefined,
): Promise<BookingSourceFields | null> {
	const ref = normalizeSourceRef(raw);
	if (!ref) return null;

	const source = await db.source.findUnique({ where: { code: ref }, select: { id: true } });
	return { sourceId: source?.id ?? null, sourceRef: ref };
}

export async function requireActiveSource(db: SourceDb, sourceId: string) {
	const source = await db.source.findUnique({ where: { id: sourceId } });
	if (!source) throw new AppException(AppErrorCode.SOURCE_NOT_FOUND);
	if (!source.isActive) throw new AppException(AppErrorCode.SOURCE_NOT_AVAILABLE);
	return source;
}
