import { Prisma } from '@prisma/client';
import { AppErrorCode, autoSourceNameKey, DIRECT_SOURCE_CODE, normalizeSourceRef } from '@event-space/shared';
import { AppException } from '@shared';

type SourceDb = { source: Prisma.TransactionClient['source'] };

export interface BookingSourceFields {
	sourceId: string;
	sourceRef: string;
}

export async function resolveSourceRef(
	db: SourceDb,
	raw: string | null | undefined,
): Promise<BookingSourceFields> {
	const code = normalizeSourceRef(raw) ?? DIRECT_SOURCE_CODE;

	const existing = await db.source.findUnique({ where: { code }, select: { id: true } });
	if (existing) return { sourceId: existing.id, sourceRef: code };

	try {
		const created = await db.source.create({
			data: { code, name: code, nameKey: autoSourceNameKey(code) },
			select: { id: true },
		});
		return { sourceId: created.id, sourceRef: code };
	} catch (error) {
		if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
		const raced = await db.source.findUnique({ where: { code }, select: { id: true } });
		if (!raced) throw error;
		return { sourceId: raced.id, sourceRef: code };
	}
}

export async function requireActiveSource(db: SourceDb, sourceId: string) {
	const source = await db.source.findUnique({ where: { id: sourceId } });
	if (!source) throw new AppException(AppErrorCode.SOURCE_NOT_FOUND);
	if (!source.isActive) throw new AppException(AppErrorCode.SOURCE_NOT_AVAILABLE);
	return source;
}
