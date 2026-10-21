import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';

const CURRENCY = 'AMD';

export type QueuedRefundKind = 'full' | 'withhold-fee';

const QUEUED_REASON = /^\[queued:(full|withhold-fee)\] ([\s\S]*)$/;

export function queuedRefundReason(kind: QueuedRefundKind, text: string): string {
	return `[queued:${kind}] ${text}`;
}

export function parseQueuedRefundReason(
	reason: string | null,
): { kind: QueuedRefundKind; text: string } | null {
	const match = reason ? QUEUED_REASON.exec(reason) : null;
	return match ? { kind: match[1] as QueuedRefundKind, text: match[2] } : null;
}

export interface QueuedRefundRow {
	id: string;
	bookingId: string;
	stripePaymentIntentId: string;
	operationKey: string;
	amount: Prisma.Decimal;
	reason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

const QUEUED = { type: 'REFUND', status: 'PENDING', amount: { gt: 0 } } as const;

@Injectable()
export class BookingLedgerService {
	constructor(private readonly prisma: PrismaService) {}

	recordCharge(
		tx: Prisma.TransactionClient,
		params: {
			bookingId: string;
			paymentIntentId: string;
			amount: Prisma.Decimal;
			reason: string;
		},
	) {
		return tx.bookingAdjustment.create({
			data: {
				bookingId: params.bookingId,
				type: 'CHARGE',
				amount: params.amount,
				currency: CURRENCY,
				stripePaymentIntentId: params.paymentIntentId,
				status: 'SUCCEEDED',
				reason: params.reason,
			},
		});
	}

	async recordOfflinePayment(
		tx: Prisma.TransactionClient,
		bookingId: string,
		amount: number,
	): Promise<void> {
		const recorded = await tx.bookingAdjustment.groupBy({
			by: ['type'],
			where: { bookingId, stripePaymentIntentId: null, status: 'SUCCEEDED' },
			_sum: { amount: true },
		});

		const alreadyTaken = recorded.reduce((sum, row) => {
			const value = Number(row._sum.amount ?? 0);
			return row.type === 'REFUND' ? sum - value : sum + value;
		}, 0);

		const delta = parseFloat((amount - alreadyTaken).toFixed(2));
		if (delta === 0) return;

		await tx.bookingAdjustment.create({
			data: {
				bookingId,
				type: delta > 0 ? 'CHARGE' : 'REFUND',
				amount: new Prisma.Decimal(Math.abs(delta).toFixed(2)),
				currency: CURRENCY,
				stripePaymentIntentId: null,
				status: 'SUCCEEDED',
				reason:
					delta > 0
						? 'Paid offline, entered by an admin'
						: 'Offline booking reduced by an admin, difference returned',
			},
		});
	}

	recordChargeIfMissing(params: {
		bookingId: string;
		paymentIntentId: string;
		amountInCents: number;
		reason: string;
	}) {
		return this.prisma.bookingAdjustment.upsert({
			where: {
				stripePaymentIntentId_type_operationKey: {
					stripePaymentIntentId: params.paymentIntentId,
					type: 'CHARGE',
					operationKey: '',
				},
			},
			create: {
				bookingId: params.bookingId,
				type: 'CHARGE',
				amount: toAmount(params.amountInCents),
				currency: CURRENCY,
				stripePaymentIntentId: params.paymentIntentId,
				status: 'SUCCEEDED',
				reason: params.reason,
			},
			update: {},
		});
	}

	recordRefund(params: {
		bookingId: string;
		paymentIntentId: string;
		amountInCents: number;
		stripeRefundId: string;
		reason: string;
		overwriteReason?: boolean;
		operationKey?: string;
	}) {
		const operationKey = params.operationKey ?? '';

		return this.prisma.bookingAdjustment.upsert({
			where: {
				stripePaymentIntentId_type_operationKey: {
					stripePaymentIntentId: params.paymentIntentId,
					type: 'REFUND',
					operationKey,
				},
			},
			create: {
				bookingId: params.bookingId,
				type: 'REFUND',
				amount: toAmount(params.amountInCents),
				currency: CURRENCY,
				stripePaymentIntentId: params.paymentIntentId,
				stripeRefundId: params.stripeRefundId,
				status: 'SUCCEEDED',
				reason: params.reason,
				operationKey,
			},
			update: {
				stripeRefundId: params.stripeRefundId,
				status: 'SUCCEEDED',
				...(params.overwriteReason ? { reason: params.reason } : {}),
			},
		});
	}

	recordFailedRefund(params: {
		bookingId: string;
		paymentIntentId: string;
		reason: string;
		operationKey?: string;
	}) {
		return this.recordRefundWithoutMoney({ ...params, status: 'FAILED' });
	}

	recordRefundWithoutMoney(params: {
		bookingId: string;
		paymentIntentId: string;
		status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
		reason: string;
		operationKey?: string;
	}) {
		const operationKey = params.operationKey ?? '';

		return this.prisma.bookingAdjustment.upsert({
			where: {
				stripePaymentIntentId_type_operationKey: {
					stripePaymentIntentId: params.paymentIntentId,
					type: 'REFUND',
					operationKey,
				},
			},
			create: {
				bookingId: params.bookingId,
				type: 'REFUND',
				amount: new Prisma.Decimal('0'),
				currency: CURRENCY,
				stripePaymentIntentId: params.paymentIntentId,
				stripeRefundId: null,
				status: params.status,
				reason: params.reason,
				operationKey,
			},
			update: {
				status: params.status,
				reason: params.reason,
			},
		});
	}

	queueRefunds(
		tx: Prisma.TransactionClient,
		rows: {
			bookingId: string;
			paymentIntentId: string;
			amount: number;
			kind: QueuedRefundKind;
			reason: string;
			operationKey?: string;
		}[],
	) {
		if (rows.length === 0) return Promise.resolve({ count: 0 });

		return tx.bookingAdjustment.createMany({
			data: rows.map((row) => ({
				bookingId: row.bookingId,
				type: 'REFUND' as const,
				amount: new Prisma.Decimal(row.amount.toFixed(2)),
				currency: CURRENCY,
				stripePaymentIntentId: row.paymentIntentId,
				status: 'PENDING' as const,
				reason: queuedRefundReason(row.kind, row.reason),
				operationKey: row.operationKey ?? '',
			})),
			skipDuplicates: true,
		});
	}

	async completeQueuedRefund(params: {
		paymentIntentId: string;
		amountInCents: number;
		stripeRefundId: string | null;
		reason: string;
		operationKey?: string;
	}): Promise<boolean> {
		const result = await this.prisma.bookingAdjustment.updateMany({
			where: {
				stripePaymentIntentId: params.paymentIntentId,
				operationKey: params.operationKey ?? '',
				...QUEUED,
			},
			data: {
				status: 'SUCCEEDED',
				amount: toAmount(params.amountInCents),
				stripeRefundId: params.stripeRefundId,
				reason: params.reason,
			},
		});

		return result.count > 0;
	}

	async touchQueuedRefund(paymentIntentId: string, operationKey = ''): Promise<boolean> {
		const result = await this.prisma.bookingAdjustment.updateMany({
			where: { stripePaymentIntentId: paymentIntentId, operationKey, ...QUEUED },
			data: { updatedAt: new Date() },
		});

		return result.count > 0;
	}

	async discardQueuedRefund(paymentIntentId: string, operationKey = ''): Promise<void> {
		await this.prisma.bookingAdjustment.deleteMany({
			where: { stripePaymentIntentId: paymentIntentId, operationKey, ...QUEUED },
		});
	}

	findQueuedRefunds(params: { idleBefore: Date; limit: number }): Promise<QueuedRefundRow[]> {
		return this.prisma.bookingAdjustment.findMany({
			where: {
				...QUEUED,
				stripePaymentIntentId: { not: null },
				updatedAt: { lte: params.idleBefore },
			},
			orderBy: { createdAt: 'asc' },
			take: params.limit,
			select: {
				id: true,
				bookingId: true,
				stripePaymentIntentId: true,
				operationKey: true,
				amount: true,
				reason: true,
				createdAt: true,
				updatedAt: true,
			},
		}) as Promise<QueuedRefundRow[]>;
	}

	async claimQueuedRefund(row: Pick<QueuedRefundRow, 'id' | 'updatedAt'>): Promise<boolean> {
		const result = await this.prisma.bookingAdjustment.updateMany({
			where: { id: row.id, ...QUEUED, updatedAt: row.updatedAt },
			data: { updatedAt: new Date() },
		});

		return result.count > 0;
	}

	async abandonQueuedRefund(id: string, reason: string): Promise<void> {
		await this.prisma.bookingAdjustment.updateMany({
			where: { id, ...QUEUED },
			data: { status: 'FAILED', reason },
		});
	}

	async hasCancellationRefund(bookingId: string): Promise<boolean> {
		const row = await this.prisma.bookingAdjustment.findFirst({
			where: {
				bookingId,
				type: 'REFUND',
				operationKey: { in: ['', `cancel:${bookingId}`] },
				status: { in: ['SUCCEEDED', 'PENDING'] },
			},
			select: { id: true },
		});

		return row !== null;
	}

	listForBooking(db: Pick<Prisma.TransactionClient, 'bookingAdjustment'>, bookingId: string) {
		return db.bookingAdjustment.findMany({
			where: { bookingId },
			orderBy: { createdAt: 'asc' },
			select: {
				id: true,
				type: true,
				status: true,
				amount: true,
				stripePaymentIntentId: true,
				feeAmount: true,
				operationKey: true,
				createdAt: true,
			},
		});
	}

	recordManualRefund(
		tx: Prisma.TransactionClient,
		params: {
			bookingId: string;
			paymentIntentId: string | null;
			amountInCents: number;
			reason: string;
			operationKey: string;
		},
	) {
		const data = {
			bookingId: params.bookingId,
			type: 'REFUND' as const,
			amount: toAmount(params.amountInCents),
			currency: CURRENCY,
			stripePaymentIntentId: params.paymentIntentId,
			status: 'SUCCEEDED' as const,
			reason: params.reason,
			operationKey: params.operationKey,
		};

		if (!params.paymentIntentId) return tx.bookingAdjustment.create({ data });

		return tx.bookingAdjustment.upsert({
			where: {
				stripePaymentIntentId_type_operationKey: {
					stripePaymentIntentId: params.paymentIntentId,
					type: 'REFUND',
					operationKey: params.operationKey,
				},
			},
			create: data,
			update: { status: 'SUCCEEDED', amount: data.amount, reason: data.reason },
		});
	}

	async chargesMissingFee(bookingId: string): Promise<string[]> {
		const rows = await this.prisma.bookingAdjustment.findMany({
			where: {
				bookingId,
				type: 'CHARGE',
				status: 'SUCCEEDED',
				feeAmount: null,
				stripePaymentIntentId: { not: null },
			},
			select: { stripePaymentIntentId: true },
		});

		return rows.map((row) => row.stripePaymentIntentId as string);
	}

	attachFee(paymentIntentId: string, feeInCents: number) {
		return this.prisma.bookingAdjustment.updateMany({
			where: { stripePaymentIntentId: paymentIntentId, type: 'CHARGE', feeAmount: null },
			data: { feeAmount: toAmount(feeInCents) },
		});
	}
}

function toAmount(amountInCents: number): Prisma.Decimal {
	return new Prisma.Decimal((amountInCents / 100).toString());
}
