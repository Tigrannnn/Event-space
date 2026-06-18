import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Generates a new booking reference number using a dedicated database counter table.
 * This avoids raw sequence SQL in business logic and keeps the value sequential.
 * The raw value starts at 1; UI formatting pads it to at least 6 digits.
 */
export async function getNextBookingReference(tx: Prisma.TransactionClient): Promise<number> {
	const counter = await tx.bookingReference.create({ data: {} });
	return counter.id;
}
