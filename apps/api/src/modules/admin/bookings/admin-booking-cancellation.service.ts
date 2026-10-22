import { Injectable } from '@nestjs/common';
import { adminCancelReason } from '@event-space/shared';
import { PrismaService } from '@infra/prisma/prisma.service';
import { AppException } from '@shared';
import { AppErrorCode } from '@event-space/shared';
import type { AdminCancelBookingData } from '@event-space/shared';
import { resolveRefundPolicy } from '@modules/booking/booking.utils';
import { BookingLedgerService } from '@modules/booking/money/booking-ledger.service';
import { BookingRefundService } from '@modules/booking/money/booking-refund.service';

@Injectable()
export class AdminBookingCancellationService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly ledger: BookingLedgerService,
		private readonly refunds: BookingRefundService,
	) {}

	async cancel(adminId: string, bookingId: string, data: AdminCancelBookingData) {
		const { refundType = 'RULES', refundMethod = 'STRIPE', reason } = data;

		const owner = await this.prisma.booking.findUnique({
			where: { id: bookingId },
			select: { paymentIntentId: true },
		});
		if (!owner) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);
		await this.refunds.prepare(bookingId, owner.paymentIntentId);

		const adminReason = adminCancelReason(adminId, reason);

		const { booking, alreadyCancelled, queued } = await this.prisma.$transaction(async (tx) => {
			const current = await tx.booking.findUnique({
				where: { id: bookingId },
				include: { occurrence: { include: { event: { include: { cancellationRules: true } } } } },
			});

			if (!current) throw new AppException(AppErrorCode.BOOKING_NOT_FOUND);

			const alreadyCancelled = current.status === 'CANCELLED';
			if (alreadyCancelled && (await this.ledger.hasCancellationRefund(current.id))) {
				return { booking: current, alreadyCancelled, queued: null };
			}

			if (!alreadyCancelled) {
				if (current.status === 'CONFIRMED') {
					await tx.eventOccurrence.updateMany({
						where: { id: current.occurrenceId, currentParticipants: { gte: current.quantity } },
						data: { currentParticipants: { decrement: current.quantity } },
					});
				}
				await tx.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED' } });
			}

			const byRules = resolveRefundPolicy({
				now: new Date(),
				occurrenceDate: new Date(current.occurrence?.date ?? new Date()),
				rules: current.occurrence?.event?.cancellationRules ?? [],
				rescheduleRefundUntil: current.rescheduleRefundUntil,
			});
			const percentage = refundType === 'FULL' ? 100 : byRules.percentage;

			const queued = await this.refunds.queueCancellation(tx, current, {
				percentage,
				withholdFee: refundType === 'RULES' && byRules.withholdStripeFee,
				reason: adminReason,
				method: current.paymentIntentId ? refundMethod : 'MANUAL',
			});

			return { booking: current, alreadyCancelled, queued };
		});

		const respond = (processed: boolean, message: string) => ({
			booking: { ...booking, amount: Number(booking.amount), status: 'CANCELLED' },
			refundType,
			refundMethod: queued?.method ?? refundMethod,
			reason: reason ?? null,
			processed,
			message,
		});

		if (!queued) {
			return respond(
				false,
				alreadyCancelled
					? 'Booking was already cancelled and its refund is recorded.'
					: 'Booking cancelled without payment refund processing.',
			);
		}

		const outcome = await this.refunds.settleCancellation(
			queued,
			'Refund could not be processed at Stripe (admin cancellation)',
			' (admin cancellation)',
		);

		if (outcome.coveredByFee) {
			return respond(
				true,
				'Booking cancelled. The refund by the cancellation rules is covered entirely by the payment provider fee, so nothing was refunded.',
			);
		}

		if (queued.method === 'MANUAL') {
			return respond(
				queued.plan.netInCents > 0,
				`Booking cancelled. A refund of ${(queued.plan.netInCents / 100).toFixed(2)} AMD is recorded as returned by hand.`,
			);
		}

		return respond(
			outcome.refundedInCents !== null || outcome.failed,
			refundType === 'FULL'
				? 'Booking cancelled and refund processed.'
				: 'Booking cancelled and refund processed according to cancellation rules.',
		);
	}
}
