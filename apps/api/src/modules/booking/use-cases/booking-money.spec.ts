import { booking, cancelCalls, createWorld, refundCalls } from '../testing/booking-world';
import type { LedgerRow } from '../testing/booking-world';

const MINUTE = 60 * 1000;

function ageRows(table: LedgerRow[], by: number) {
	for (const row of table) {
		row.updatedAt = new Date(Date.now() - by);
		row.createdAt = new Date(Date.now() - by);
	}
}

const queuedRefund = (reason: string, kind: 'full' | 'withhold-fee') =>
	`[queued:${kind}] ${reason}`;

describe('money paths: cancel by the client', () => {
	it('refunds the rule percentage minus the Stripe fee and closes the queued row', async () => {
		const { service, stripeCalls, table, ledger, emails } = createWorld({ fee: 90000 });
		await service.cancel('u1', 'b1', 'ru');

		expect(refundCalls(stripeCalls)).toEqual([
			{ method: 'refund', args: ['pi_b1', 'refund-pi_b1-1910000', 1910000] },
		]);
		expect(table).toHaveLength(1);
		expect(table[0]).toMatchObject({
			bookingId: 'b1',
			type: 'REFUND',
			currency: 'AMD',
			stripePaymentIntentId: 'pi_b1',
			stripeRefundId: 're_pi_b1',
			status: 'SUCCEEDED',
			amount: 19100,
			reason: 'Booking cancelled. Stripe fee withheld.',
		});
		expect(ledger).toHaveLength(0);
		expect(emails[0].payload).toMatchObject({ refundAmount: 19100 });
	});

	it('writes the refund down in the same transaction that cancels the booking', async () => {
		const { service, table, bookingUpdates } = createWorld({ stripeFails: true });
		await service.cancel('u1', 'b1', 'ru');

		expect(bookingUpdates).toContainEqual({
			op: 'update',
			args: { where: { id: 'b1' }, data: { status: 'CANCELLED' } },
		});
		expect(table).toHaveLength(1);
		expect(table[0].reason).toBe(
			queuedRefund('Booking cancelled. Stripe fee withheld.', 'withhold-fee'),
		);
	});

	it('withholds the Stripe fee even in the full-refund window, so booking and cancelling is never free', async () => {
		const { service, table } = createWorld({ fee: 90000 });
		await service.cancel('u1', 'b1', 'ru');

		const paid = 20000;
		expect(table[0].amount).toBe(paid - 900);
	});

	it('tells the client, and records, when the Stripe fee eats the whole refund', async () => {
		const { service, stripeCalls, table, ledger, emails } = createWorld({
			bookings: [booking({ id: 'b1', amount: 1000 })],
			tourInHours: 30,
			fee: 90000,
		});
		await service.cancel('u1', 'b1', 'ru');

		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(table).toHaveLength(1);
		expect(table[0]).toMatchObject({
			status: 'SUCCEEDED',
			amount: 0,
			stripeRefundId: null,
		});
		expect(table[0].reason).toContain('covers it entirely');
		expect(ledger).toHaveLength(0);
		expect(emails[0].payload).toMatchObject({ refundCoveredByFee: { entitled: 500, fee: 900 } });
		expect(emails[0].payload.refundAmount).toBeUndefined();
		expect(emails[0].payload.refundFailed).toBe(false);
	});

	it('refunds half when the rules say half', async () => {
		const { service, stripeCalls, table } = createWorld({ tourInHours: 30, fee: 90000 });
		await service.cancel('u1', 'b1', 'ru');

		expect(refundCalls(stripeCalls)[0].args).toEqual(['pi_b1', 'refund-pi_b1-910000', 910000]);
		expect(table[0]).toMatchObject({ status: 'SUCCEEDED', amount: 9100 });
	});

	it('refunds nothing and writes nothing when the cancellation rules give zero', async () => {
		const { service, stripeCalls, table, emails } = createWorld({
			rules: [{ hoursBeforeEvent: 24 * 30, refundPercentage: 100 }],
		});
		await service.cancel('u1', 'b1', 'ru');

		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(stripeCalls.some((call) => call.method === 'getCharge')).toBe(false);
		expect(table).toHaveLength(0);
		expect(emails[0].payload.refundAmount).toBeUndefined();
	});

	it('cancels the payment intent when it was never paid, and leaves no refund behind', async () => {
		const { service, stripeCalls, table } = createWorld({ intentStatus: 'requires_payment_method' });
		await service.cancel('u1', 'b1', 'ru');

		expect(cancelCalls(stripeCalls)).toEqual([
			{ method: 'cancelPaymentIntent', args: ['pi_b1', 'cancel-pi_b1'] },
		]);
		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(table).toHaveLength(0);
	});

	it('keeps the refund queued for a retry when Stripe refuses', async () => {
		const { service, table, emails } = createWorld({ stripeFails: true });
		await service.cancel('u1', 'b1', 'ru');

		expect(table).toHaveLength(1);
		expect(table[0]).toMatchObject({
			bookingId: 'b1',
			type: 'REFUND',
			stripeRefundId: null,
			status: 'PENDING',
			amount: 20000,
		});
		expect(emails[0].payload).toMatchObject({ refundFailed: true });
	});

	it('does not touch Stripe for a booking that was never paid', async () => {
		const { service, stripeCalls, table, emails } = createWorld({
			bookings: [booking({ id: 'b1', paymentIntentId: null, paymentMethod: 'PAY_ON_ARRIVAL' })],
		});
		await service.cancel('u1', 'b1', 'ru');

		expect(stripeCalls).toHaveLength(0);
		expect(table).toHaveLength(0);
		expect(emails[0].payload).toMatchObject({ nothingPaid: true });
	});

	it('does nothing a second time for an already cancelled booking', async () => {
		const { service, stripeCalls, table, emails } = createWorld({
			bookings: [booking({ id: 'b1', status: 'CANCELLED' })],
		});
		await service.cancel('u1', 'b1', 'ru');

		expect(stripeCalls).toHaveLength(0);
		expect(table).toHaveLength(0);
		expect(emails).toHaveLength(0);
	});
});

describe('money paths: cancel by the organiser', () => {
	const mixed = [
		booking({ id: 'b1' }),
		booking({ id: 'b2', paymentIntentId: 'pi_b2' }),
		booking({ id: 'b3', paymentIntentId: null, paymentMethod: 'PAY_ON_ARRIVAL' }),
	];

	it('refunds a cancelled date in full, without the fee, once the queue gets to it', async () => {
		const { service, refunds, stripeCalls, table } = createWorld({ bookings: mixed });
		await service.cancelOccurrenceBookings('o1');

		expect(refundCalls(stripeCalls)).toHaveLength(0);

		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(refundCalls(stripeCalls)).toEqual([
			{ method: 'refund', args: ['pi_b1', 'cancel:b1:pi_b1', 2000000] },
			{ method: 'refund', args: ['pi_b2', 'cancel:b2:pi_b2', 2000000] },
		]);
		expect(stripeCalls.some((call) => call.method === 'getCharge')).toBe(false);
		expect(table).toHaveLength(2);
		expect(table[0]).toMatchObject({
			bookingId: 'b1',
			type: 'REFUND',
			status: 'SUCCEEDED',
			stripeRefundId: 're_pi_b1',
			amount: 20000,
			reason: 'Occurrence cancelled. Full refund.',
		});
	});

	it('queues every refund before the first call to Stripe', async () => {
		const { service, table } = createWorld({ bookings: mixed, stripeFails: true });
		await service.cancelOccurrenceBookings('o1');

		expect(table.map((row) => [row.bookingId, row.status])).toEqual([
			['b1', 'PENDING'],
			['b2', 'PENDING'],
		]);
		expect(table[0].reason).toBe(queuedRefund('Occurrence cancelled. Full refund.', 'full'));
	});

	it('cancels the unpaid payment intents of a cancelled date and leaves no refund behind', async () => {
		const { service, refunds, stripeCalls, table } = createWorld({
			bookings: mixed,
			intentStatus: 'requires_payment_method',
		});
		await service.cancelOccurrenceBookings('o1');

		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(cancelCalls(stripeCalls)).toEqual([
			{ method: 'cancelPaymentIntent', args: ['pi_b1', 'cancel:b1:pi_b1'] },
			{ method: 'cancelPaymentIntent', args: ['pi_b2', 'cancel:b2:pi_b2'] },
		]);
		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(table).toHaveLength(0);
	});

	it('refunds a cancelled event in full and closes each queued row', async () => {
		const { service, refunds, stripeCalls, table } = createWorld({ bookings: mixed });
		await service.cancelEventBookings('e1');

		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(refundCalls(stripeCalls)).toEqual([
			{ method: 'refund', args: ['pi_b1', 'cancel:b1:pi_b1', 2000000] },
			{ method: 'refund', args: ['pi_b2', 'cancel:b2:pi_b2', 2000000] },
		]);
		expect(table[0]).toMatchObject({ status: 'SUCCEEDED', reason: 'Event cancelled. Full refund.' });
	});

	it('stops before touching Stripe when the refunds could not be written down', async () => {
		const { service, table, stripeCalls } = createWorld({ bookings: mixed, failQueueInsert: true });

		await expect(service.cancelEventBookings('e1')).rejects.toThrow('database down');
		expect(table).toHaveLength(0);
		expect([...refundCalls(stripeCalls), ...cancelCalls(stripeCalls)]).toHaveLength(0);
	});
});

describe('money paths: payment confirmation', () => {
	const pending = [booking({ id: 'b1', status: 'PENDING' })];

	it('records the charge, then the fee, and confirms the booking', async () => {
		const { service, ledger, bookingUpdates, emails } = createWorld({
			bookings: pending,
			fee: 90000,
		});
		const confirmed = await service.reconcilePayment('pi_b1', 'b1');

		expect(confirmed).toMatchObject({ status: 'CONFIRMED' });
		expect(ledger[0]).toMatchObject({
			where: 'tx.create',
			create: {
				bookingId: 'b1',
				type: 'CHARGE',
				currency: 'AMD',
				stripePaymentIntentId: 'pi_b1',
				status: 'SUCCEEDED',
				reason: 'Payment captured',
			},
		});
		expect(ledger[1]).toMatchObject({
			where: 'updateMany',
			create: { where: { stripePaymentIntentId: 'pi_b1', type: 'CHARGE', feeAmount: null } },
		});
		expect(bookingUpdates.length).toBeGreaterThan(0);
		expect(emails.map((email) => email.kind)).toEqual(['confirmation']);
		expect(emails[0].payload).toMatchObject({
			to: 'a@x.am',
			locale: 'ru',
			userName: 'Ани',
			referenceNumber: 42,
			eventTitle: 'Татев',
			quantity: 1,
			amount: 20000,
			currency: 'AMD',
			paymentMethod: 'SITE_PAYMENT',
		});
	});

	it('refunds automatically and writes the charge first when the seats ran out', async () => {
		const { service, stripeCalls, ledger, table, emails } = createWorld({
			bookings: pending,
			spotsFree: 0,
		});
		const result = await service.reconcilePayment('pi_b1', 'b1');

		expect(result).toMatchObject({ id: 'b1', status: 'CANCELLED' });
		expect(refundCalls(stripeCalls)).toEqual([
			{ method: 'refund', args: ['pi_b1', 'auto-refund-no-spots-b1', 2000000] },
		]);
		expect(ledger[0].where).toEqual({
			stripePaymentIntentId_type_operationKey: {
				stripePaymentIntentId: 'pi_b1',
				type: 'CHARGE',
				operationKey: '',
			},
		});
		expect(ledger[0].create).toMatchObject({
			type: 'CHARGE',
			status: 'SUCCEEDED',
			reason: 'Payment captured, then refunded automatically',
		});
		expect(Number((ledger[0].create as { amount: unknown }).amount)).toBe(20000);
		expect(table.map((row) => row.type).sort()).toEqual(['CHARGE', 'REFUND']);
		expect(table.find((row) => row.type === 'REFUND')).toMatchObject({
			status: 'SUCCEEDED',
			stripeRefundId: 're_pi_b1',
			reason: 'NO_SPOTS_LEFT',
		});
		expect(emails.map((email) => email.kind)).toEqual(['no-seats']);
		expect(emails[0].payload).toMatchObject({
			to: 'a@x.am',
			refundAmount: 20000,
			refundFailed: false,
		});
	});

	it('keeps the refund queued for the retry job when Stripe is down, and says so in the email', async () => {
		const { service, table, emails } = createWorld({
			bookings: pending,
			spotsFree: 0,
			stripeFails: true,
		});
		await service.reconcilePayment('pi_b1', 'b1');

		const refund = table.find((row) => row.type === 'REFUND');
		expect(refund).toMatchObject({ status: 'PENDING' });
		expect(refund?.reason).toContain('NO_SPOTS_LEFT');
		expect(emails[0].payload).toMatchObject({ refundFailed: true });
	});

	it('refunds a payment that arrives after the booking was cancelled and returns that booking', async () => {
		const { service, stripeCalls, table, emails } = createWorld({
			bookings: [booking({ id: 'b1', status: 'CANCELLED' })],
		});
		const result = await service.reconcilePayment('pi_b1', 'b1');

		expect(result).toMatchObject({ id: 'b1', status: 'CANCELLED' });
		expect(refundCalls(stripeCalls)).toEqual([
			{ method: 'refund', args: ['pi_b1', 'auto-refund-b1', 2000000] },
		]);
		expect(table.map((row) => row.type).sort()).toEqual(['CHARGE', 'REFUND']);
		expect(emails).toHaveLength(0);
	});

	it('leaves a booking pending while the payment has not succeeded', async () => {
		const { service, stripeCalls, ledger } = createWorld({
			bookings: pending,
			intentStatus: 'requires_payment_method',
		});
		await service.reconcilePayment('pi_b1', 'b1');

		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(ledger).toHaveLength(0);
	});
});

describe('money paths: the payment is written down before a refund', () => {
	const types = (table: { type: string }[]) => table.map((row) => row.type).sort();

	it('records a payment that was never written down when it refunds it', async () => {
		const { service, table } = createWorld({ chargeRecorded: false, fee: 90000 });
		await service.cancel('u1', 'b1', 'ru');

		expect(types(table)).toEqual(['CHARGE', 'REFUND']);
		const charge = table.find((row) => row.type === 'CHARGE');
		expect(charge).toMatchObject({
			bookingId: 'b1',
			stripePaymentIntentId: 'pi_b1',
			status: 'SUCCEEDED',
		});
		expect(Number(charge?.amount)).toBe(20000);
	});

	it('records the payment even when Stripe refuses the refund', async () => {
		const { service, table } = createWorld({ chargeRecorded: false, stripeFails: true });
		await service.cancel('u1', 'b1', 'ru');

		expect(types(table)).toEqual(['CHARGE', 'REFUND']);
	});

	it('records nothing when Stripe never took the payment', async () => {
		const { service, table } = createWorld({
			chargeRecorded: false,
			intentStatus: 'requires_payment_method',
		});
		await service.cancel('u1', 'b1', 'ru');

		expect(types(table)).not.toContain('CHARGE');
	});

	it('does not write a second payment when one is already recorded', async () => {
		const { service, table } = createWorld({ fee: 90000 });
		await service.cancel('u1', 'b1', 'ru');

		expect(types(table)).toEqual(['REFUND']);
	});
});

describe('cancelling a booking by the client after the tour started', () => {
	it('is refused, and nothing is written', async () => {
		const { service, stripeCalls, table } = createWorld({ tourInHours: -2 });

		await expect(service.cancel('u1', 'b1', 'ru')).rejects.toMatchObject({
			code: 'TOUR_ALREADY_STARTED',
		});
		expect(stripeCalls).toHaveLength(0);
		expect(table).toHaveLength(0);
	});

	it('still answers a repeated click on a booking that is already cancelled', async () => {
		const { service } = createWorld({
			tourInHours: -2,
			bookings: [booking({ id: 'b1', status: 'CANCELLED' })],
		});

		await expect(service.cancel('u1', 'b1', 'ru')).resolves.toBeDefined();
	});
});

describe('money paths: cancelling a booking whose card payment is written down', () => {
	const threeGuests = [booking({ id: 'b1', amount: 30000, quantity: 3 })];

	it('refunds the rule amount minus the card fee in one Stripe refund', async () => {
		const { service, table, stripeCalls, emails } = createWorld({
			bookings: threeGuests,
			payments: [{ paymentIntentId: 'pi_b1', amount: 30000, fee: 900 }],
		});

		await service.cancel('u1', 'b1', 'ru');

		expect(refundCalls(stripeCalls)).toEqual([
			{ method: 'refund', args: ['pi_b1', 'cancel:b1:pi_b1', 2_910_000] },
		]);
		expect(table.filter((row) => row.type === 'REFUND')).toMatchObject([
			{ status: 'SUCCEEDED', amount: 29100, operationKey: 'cancel:b1' },
		]);
		expect(emails[0].payload).toMatchObject({ refundAmount: 29100 });
	});

	it('tells the client the fee covered everything when the rules leave less than the fee', async () => {
		const { service, stripeCalls, emails } = createWorld({
			bookings: threeGuests,
			payments: [{ paymentIntentId: 'pi_b1', amount: 30000, fee: 900 }],
			rules: [{ hoursBeforeEvent: 1, refundPercentage: 2 }],
		});

		await service.cancel('u1', 'b1', 'ru');

		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(emails[0].payload).toMatchObject({ refundCoveredByFee: { entitled: 600, fee: 600 } });
	});
});
