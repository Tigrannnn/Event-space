import {
	booking,
	createWorld,
	HOUR,
	MINUTE,
	refundCalls,
	type LedgerRow,
	type World,
} from '../testing/booking-world';

const paid = [booking({ id: 'b1' }), booking({ id: 'b2', paymentIntentId: 'pi_b2' })];

function ageRows(table: LedgerRow[], by: number) {
	for (const row of table) {
		row.updatedAt = new Date(Date.now() - by);
		row.createdAt = new Date(Date.now() - by);
	}
}

describe('queued refunds', () => {
	it('finishes every refund after the process died in the middle of the loop', async () => {
		const world: World = { bookings: paid, crashOnCompleteTimes: 1 };
		const { service, refunds, table, stripeCalls, moneyMoved } = createWorld(world);

		await expect(service.cancelEventBookings('e1')).rejects.toThrow('process died');

		expect(table.map((row) => [row.bookingId, row.status])).toEqual([
			['b1', 'PENDING'],
			['b2', 'PENDING'],
		]);

		ageRows(table, 5 * MINUTE);
		const handled = await refunds.retryQueued();

		expect(handled).toBe(2);
		expect(table.map((row) => [row.bookingId, row.status, row.amount])).toEqual([
			['b1', 'SUCCEEDED', 20000],
			['b2', 'SUCCEEDED', 20000],
		]);
		expect(refundCalls(stripeCalls).map((call) => call.args[1])).toEqual([
			'cancel:b1:pi_b1',
			'cancel:b1:pi_b1',
			'cancel:b2:pi_b2',
		]);
		expect(moneyMoved()).toBe(2);
	});

	it('leaves rows alone while they are still fresh', async () => {
		const { service, refunds, table, stripeCalls } = createWorld({
			bookings: paid,
			stripeFails: true,
		});
		await service.cancelEventBookings('e1');
		const callsBefore = stripeCalls.length;

		expect(await refunds.retryQueued()).toBe(0);
		expect(stripeCalls).toHaveLength(callsBefore);
		expect(table.every((row) => row.status === 'PENDING')).toBe(true);
	});

	it('retries a refund once Stripe is reachable again', async () => {
		const world: World = { bookings: paid.slice(0, 1), stripeFails: true };
		const { service, refunds, table } = createWorld(world);
		await service.cancelOccurrenceBookings('o1');
		expect(table[0].status).toBe('PENDING');

		world.stripeFails = false;
		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(table[0]).toMatchObject({
			status: 'SUCCEEDED',
			stripeRefundId: 're_pi_b1',
			reason: 'Occurrence cancelled. Full refund.',
		});
	});

	it('does not hammer Stripe: a failed retry waits before the next one', async () => {
		const { service, refunds, table, stripeCalls } = createWorld({
			bookings: paid.slice(0, 1),
			stripeFails: true,
		});
		await service.cancelEventBookings('e1');
		ageRows(table, 5 * MINUTE);

		await refunds.retryQueued();
		const afterFirst = refundCalls(stripeCalls).length;
		await refunds.retryQueued();

		expect(table[0].status).toBe('PENDING');
		expect(refundCalls(stripeCalls)).toHaveLength(afterFirst);
	});

	it('gives up after a day and says so instead of trying again', async () => {
		const { service, refunds, table, stripeCalls } = createWorld({
			bookings: paid.slice(0, 1),
			stripeFails: true,
		});
		await service.cancelEventBookings('e1');
		ageRows(table, 25 * HOUR);
		const callsBefore = stripeCalls.length;

		await refunds.retryQueued();

		expect(table[0].status).toBe('FAILED');
		expect(table[0].reason).toContain('Check the payment in Stripe');
		expect(stripeCalls).toHaveLength(callsBefore);
	});

	it('does not run the same refund twice when two workers meet', async () => {
		const world: World = { bookings: paid.slice(0, 1), stripeFails: true };
		const { service, refunds, table, stripeCalls } = createWorld(world);
		await service.cancelEventBookings('e1');
		world.stripeFails = false;
		ageRows(table, 5 * MINUTE);
		const callsBefore = refundCalls(stripeCalls).length;

		await Promise.all([refunds.retryQueued(), refunds.retryQueued()]);

		expect(refundCalls(stripeCalls)).toHaveLength(callsBefore + 1);
		expect(table[0].status).toBe('SUCCEEDED');
	});

	it('drops a queued refund whose payment turns out never to have been paid', async () => {
		const world: World = { bookings: paid.slice(0, 1), stripeFails: true };
		const { service, refunds, table, stripeCalls } = createWorld(world);
		await service.cancelEventBookings('e1');

		world.stripeFails = false;
		world.intentStatus = 'requires_payment_method';
		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(table).toHaveLength(0);
		expect(refundCalls(stripeCalls)).toHaveLength(1);
	});

	it('withholds the Stripe fee on a retried cancellation by the client', async () => {
		const world: World = { stripeFails: true, fee: 90000 };
		const { service, refunds, table, stripeCalls } = createWorld(world);
		await service.cancel('u1', 'b1', 'ru');
		expect(table[0]).toMatchObject({ status: 'PENDING', amount: 20000 });

		world.stripeFails = false;
		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(refundCalls(stripeCalls).at(-1)?.args).toEqual(['pi_b1', 'refund-pi_b1-1910000', 1910000]);
		expect(table[0]).toMatchObject({
			status: 'SUCCEEDED',
			amount: 19100,
			reason: 'Booking cancelled. Stripe fee withheld.',
		});
	});

	it('closes a retried refund as covered when the Stripe fee is larger than what the rules give', async () => {
		const world: World = {
			bookings: [booking({ id: 'b1', amount: 1000 })],
			tourInHours: 30,
			fee: 90000,
			crashOnCompleteTimes: 1,
		};
		const { service, refunds, table, stripeCalls } = createWorld(world);

		await expect(service.cancel('u1', 'b1', 'ru')).rejects.toThrow('process died');
		expect(table[0]).toMatchObject({ status: 'PENDING', amount: 500 });

		ageRows(table, 5 * MINUTE);
		await refunds.retryQueued();

		expect(table[0]).toMatchObject({ status: 'SUCCEEDED', amount: 0 });
		expect(refundCalls(stripeCalls)).toHaveLength(0);
		expect(await refunds.retryQueued()).toBe(0);
	});

	it('never touches a refund an admin is going to make by hand', async () => {
		const { refunds, table, stripeCalls } = createWorld();
		table.push({
			id: 'manual',
			bookingId: 'b1',
			type: 'REFUND',
			amount: 0,
			currency: 'AMD',
			stripePaymentIntentId: 'pi_b1',
			stripeRefundId: null,
			feeAmount: null,
			operationKey: '',
			status: 'PENDING',
			reason: 'Manual refund requested by admin a1',
			createdAt: new Date(Date.now() - 30 * HOUR),
			updatedAt: new Date(Date.now() - 30 * HOUR),
		});

		expect(await refunds.retryQueued()).toBe(0);
		expect(table[0].status).toBe('PENDING');
		expect(stripeCalls).toHaveLength(0);
	});
});
