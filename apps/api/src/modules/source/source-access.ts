import { Prisma } from '@prisma/client';
import { AppErrorCode, autoSourceNameKey, DIRECT_SOURCE_CODE, normalizeSourceRef } from '@event-space/shared';
import { AppException } from '@shared';

type SourceDb = { source: Prisma.TransactionClient['source'] };
type UserSourceDb = SourceDb & { user: Prisma.TransactionClient['user'] };

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

export async function rememberUserSource(db: UserSourceDb, userId: string, source: BookingSourceFields) {
	const replaceable =
		source.sourceRef === DIRECT_SOURCE_CODE
			? { sourceId: null }
			: { OR: [{ sourceId: null }, { source: { code: DIRECT_SOURCE_CODE } }] };

	await db.user.updateMany({ where: { id: userId, ...replaceable }, data: { sourceId: source.sourceId } });
}

export async function sourceForUser(
	db: UserSourceDb,
	userId: string,
	raw: string | null | undefined,
): Promise<BookingSourceFields> {
	const source = await resolveSourceRef(db, raw);
	if (source.sourceRef !== DIRECT_SOURCE_CODE) {
		await rememberUserSource(db, userId, source);
		return source;
	}

	const user = await db.user.findUnique({
		where: { id: userId },
		select: { source: { select: { id: true, code: true } } },
	});
	if (user?.source) return { sourceId: user.source.id, sourceRef: user.source.code };

	await rememberUserSource(db, userId, source);
	return source;
}

export async function requireActiveSource(db: SourceDb, sourceId: string) {
	const source = await db.source.findUnique({ where: { id: sourceId } });
	if (!source) throw new AppException(AppErrorCode.SOURCE_NOT_FOUND);
	if (!source.isActive) throw new AppException(AppErrorCode.SOURCE_NOT_AVAILABLE);
	return source;
}
