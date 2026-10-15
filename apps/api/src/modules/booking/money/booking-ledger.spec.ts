import { BookingLedgerService } from './booking-ledger.service';

function build(recorded: { type: 'CHARGE' | 'REFUND'; sum: number }[]) {
	const created: { data: Record<string, unknown> }[] = [];
	const tx = {
		bookingAdjustment: {
			groupBy: () =>
				Promise.resolve(recorded.map((row) => ({ type: row.type, _sum: { amount: row.sum } }))),
			create: (args: { data: Record<string, unknown> }) => {
				created.push(args);
				return Promise.resolve({});
			},
		},
	};
	const service = new BookingLedgerService({} as never);
	return { service, tx: tx as never, created };
}

describe('offline payments in the ledger', () => {
	it('records the first payment as a charge', async () => {
		const { service, tx, created } = build([]);
		await service.recordOfflinePayment(tx, 'b1', 20000);

		expect(created).toHaveLength(1);
		expect(created[0].data).toMatchObject({
			bookingId: 'b1',
			type: 'CHARGE',
			currency: 'AMD',
			stripePaymentIntentId: null,
			status: 'SUCCEEDED',
			reason: 'Paid offline, entered by an admin',
		});
		expect(Number(created[0].data.amount)).toBe(20000);
	});

	it('writes nothing when the amount did not change', async () => {
		const { service, tx, created } = build([{ type: 'CHARGE', sum: 20000 }]);
		await service.recordOfflinePayment(tx, 'b1', 20000);

		expect(created).toHaveLength(0);
	});

	it('writes only the difference when the amount grew', async () => {
		const { service, tx, created } = build([{ type: 'CHARGE', sum: 20000 }]);
		await service.recordOfflinePayment(tx, 'b1', 30000);

		expect(created[0].data).toMatchObject({ type: 'CHARGE' });
		expect(Number(created[0].data.amount)).toBe(10000);
	});

	it('records a reduction as a refund of the difference', async () => {
		const { service, tx, created } = build([{ type: 'CHARGE', sum: 20000 }]);
		await service.recordOfflinePayment(tx, 'b1', 15000);

		expect(created[0].data).toMatchObject({
			type: 'REFUND',
			reason: 'Offline booking reduced by an admin, difference returned',
		});
		expect(Number(created[0].data.amount)).toBe(5000);
	});

	it('counts earlier refunds when working out what was taken', async () => {
		const { service, tx, created } = build([
			{ type: 'CHARGE', sum: 20000 },
			{ type: 'REFUND', sum: 5000 },
		]);
		await service.recordOfflinePayment(tx, 'b1', 15000);

		expect(created).toHaveLength(0);
	});
});
