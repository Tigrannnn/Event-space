import { summarizeBookingMoney, type MoneyAdjustment } from './booking-money';
import { allocatePartialRefund } from './refund-allocation';

const day = (n: number) => new Date(Date.UTC(2026, 9, n));

function charge(
	amount: number,
	over: Partial<MoneyAdjustment> & { at?: number } = {},
): MoneyAdjustment {
	const { at = 1, ...rest } = over;
	return {
		type: 'CHARGE',
		status: 'SUCCEEDED',
		amount,
		stripePaymentIntentId: 'pi_1',
		feeAmount: null,
		feeWithheld: null,
		createdAt: day(at),
		...rest,
	};
}

function refund(
	amount: number,
	over: Partial<MoneyAdjustment> & { at?: number } = {},
): MoneyAdjustment {
	const { at = 5, ...rest } = over;
	return {
		type: 'REFUND',
		status: 'SUCCEEDED',
		amount,
		stripePaymentIntentId: 'pi_1',
		feeAmount: null,
		feeWithheld: null,
		createdAt: day(at),
		...rest,
	};
}

describe('summarizeBookingMoney', () => {
	it('splits a booking into card and offline payments, oldest first', () => {
		const money = summarizeBookingMoney(
			[
				charge(10000, { stripePaymentIntentId: null, at: 3 }),
				charge(30000, { feeAmount: 900, at: 1 }),
			],
			40000,
		);

		expect(money.payments.map((part) => [part.method, part.chargedInCents])).toEqual([
			['CARD', 3000000],
			['OFFLINE', 1000000],
		]);
		expect(money).toMatchObject({ dueInCents: 0, keptInCents: 0 });
	});

	it('shows what the client still owes after guests were added without payment', () => {
		const money = summarizeBookingMoney([charge(30000)], 40000);
		expect(money.dueInCents).toBe(1000000);
	});

	it('does not count a refund that failed, and counts one that is still queued', () => {
		const money = summarizeBookingMoney(
			[charge(30000), refund(0, { status: 'FAILED' }), refund(10000, { status: 'PENDING' })],
			20000,
		);

		expect(money.refundedInCents).toBe(1000000);
		expect(money).toMatchObject({ dueInCents: 0, keptInCents: 0 });
	});

	it('does not treat the fee the client bears as money owed to the client', () => {
		const money = summarizeBookingMoney(
			[charge(30000, { feeAmount: 900 }), refund(9700, { feeWithheld: 300 })],
			20000,
		);

		expect(money).toMatchObject({ attributableInCents: 2000000, dueInCents: 0, keptInCents: 0 });
	});

	it('reports money kept when the booking got cheaper but the rules held part back', () => {
		const money = summarizeBookingMoney([charge(30000), refund(5000, { feeWithheld: 0 })], 20000);

		expect(money.keptInCents).toBe(500000);
	});
});

describe('allocatePartialRefund', () => {
	const input = (adjustments: MoneyAdjustment[], amount: number) =>
		summarizeBookingMoney(adjustments, amount).payments;

	it('refunds the share of one guest and holds back one third of the fee', () => {
		const result = allocatePartialRefund({
			payments: input([charge(30000, { feeAmount: 900 })], 30000),
			removedUnits: 1,
			unitPriceInCents: 1000000,
			percentage: 100,
		});

		expect(result).toMatchObject({
			grossInCents: 1000000,
			netInCents: 970000,
			feeWithheldInCents: 30000,
		});
		expect(result.parts).toHaveLength(1);
	});

	it('applies the cancellation rules to the removed guest only', () => {
		const result = allocatePartialRefund({
			payments: input([charge(30000, { feeAmount: 900 })], 30000),
			removedUnits: 1,
			unitPriceInCents: 1000000,
			percentage: 50,
		});

		expect(result).toMatchObject({ grossInCents: 500000, netInCents: 470000 });
	});

	it('takes what is left of the fee when the next guest leaves', () => {
		const payments = input(
			[charge(30000, { feeAmount: 900 }), refund(9700, { feeWithheld: 300 })],
			20000,
		);
		const result = allocatePartialRefund({
			payments,
			removedUnits: 1,
			unitPriceInCents: 1000000,
			percentage: 100,
		});

		expect(result).toMatchObject({ netInCents: 970000, feeWithheldInCents: 30000 });
	});

	it('returns the newest payment first and the cash part by hand', () => {
		const payments = input(
			[
				charge(30000, { feeAmount: 900, at: 1 }),
				charge(10000, { stripePaymentIntentId: null, at: 3 }),
			],
			40000,
		);

		const one = allocatePartialRefund({
			payments,
			removedUnits: 1,
			unitPriceInCents: 1000000,
			percentage: 100,
		});
		expect(one.parts).toEqual([
			{
				method: 'OFFLINE',
				paymentIntentId: null,
				grossInCents: 1000000,
				netInCents: 1000000,
				feeWithheldInCents: 0,
			},
		]);

		const two = allocatePartialRefund({
			payments,
			removedUnits: 2,
			unitPriceInCents: 1000000,
			percentage: 100,
		});
		expect(two.parts.map((part) => [part.method, part.netInCents])).toEqual([
			['OFFLINE', 1000000],
			['CARD', 970000],
		]);
	});

	it('refunds only what was really paid when the booking was never fully paid', () => {
		const result = allocatePartialRefund({
			payments: input([charge(10000)], 30000),
			removedUnits: 2,
			unitPriceInCents: 1000000,
			percentage: 100,
		});

		expect(result.consumedInCents).toBe(1000000);
		expect(result.grossInCents).toBe(1000000);
	});

	it('refunds nothing for a booking with no payments, such as pay on arrival', () => {
		const result = allocatePartialRefund({
			payments: [],
			removedUnits: 1,
			unitPriceInCents: 1000000,
			percentage: 100,
		});

		expect(result.parts).toEqual([]);
		expect(result.grossInCents).toBe(0);
	});

	it('never withholds more fee than the refund itself', () => {
		const result = allocatePartialRefund({
			payments: input([charge(100, { feeAmount: 90 })], 100),
			removedUnits: 1,
			unitPriceInCents: 10000,
			percentage: 1,
		});

		expect(result.parts[0].netInCents).toBeGreaterThanOrEqual(0);
	});
});
