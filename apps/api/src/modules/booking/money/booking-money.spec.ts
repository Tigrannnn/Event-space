import { readPayments, type LedgerRow } from './booking-money';
import { planGuestRefund } from './refund-allocation';

const day = (n: number) => new Date(Date.UTC(2026, 9, n));

const row = (over: Partial<LedgerRow> & Pick<LedgerRow, 'type' | 'amount'>): LedgerRow => ({
	status: 'SUCCEEDED',
	stripePaymentIntentId: 'pi_1',
	feeAmount: null,
	createdAt: day(1),
	...over,
});

const fiveGuestsByCard = () =>
	readPayments([row({ type: 'CHARGE', amount: 50000, feeAmount: 5000 })]);

describe('readPayments', () => {
	it('groups card payments by payment and keeps cash apart', () => {
		const payments = readPayments([
			row({ type: 'CHARGE', amount: 50000, feeAmount: 5000 }),
			row({
				type: 'CHARGE',
				amount: 20000,
				feeAmount: 2000,
				stripePaymentIntentId: 'pi_2',
				createdAt: day(3),
			}),
			row({ type: 'REFUND', amount: 9000, createdAt: day(4) }),
			row({ type: 'CHARGE', amount: 7000, stripePaymentIntentId: null }),
		]);

		expect(payments.cards).toEqual([
			{
				paymentIntentId: 'pi_1',
				chargedInCents: 5_000_000,
				refundedInCents: 900_000,
				feeInCents: 500_000,
				paidAt: day(1),
			},
			{
				paymentIntentId: 'pi_2',
				chargedInCents: 2_000_000,
				refundedInCents: 0,
				feeInCents: 200_000,
				paidAt: day(3),
			},
		]);
		expect(payments.cashInCents).toBe(700_000);
	});

	it('ignores failed refunds and unfinished charges, counts queued refunds as taken', () => {
		const payments = readPayments([
			row({ type: 'CHARGE', amount: 50000, feeAmount: 5000 }),
			row({ type: 'CHARGE', amount: 10000, status: 'PENDING', stripePaymentIntentId: 'pi_2' }),
			row({ type: 'REFUND', amount: 9000, status: 'FAILED' }),
			row({ type: 'REFUND', amount: 4000, status: 'PENDING' }),
		]);

		expect(payments.cards).toHaveLength(1);
		expect(payments.cards[0].refundedInCents).toBe(400_000);
	});
});

describe('planGuestRefund', () => {
	it('refunds one guest of five: unit price minus that guest share of the card fee', () => {
		const plan = planGuestRefund({
			payments: fiveGuestsByCard(),
			guests: 1,
			unitPriceInCents: 1_000_000,
			percentage: 100,
			withholdFee: true,
		});

		expect(plan).toMatchObject({
			grossInCents: 1_000_000,
			feeInCents: 100_000,
			netInCents: 900_000,
			paidByCard: true,
		});
		expect(plan.parts).toEqual([{ paymentIntentId: 'pi_1', amountInCents: 900_000 }]);
	});

	it('applies the cancellation rule percentage before the fee', () => {
		const plan = planGuestRefund({
			payments: fiveGuestsByCard(),
			guests: 2,
			unitPriceInCents: 1_000_000,
			percentage: 50,
			withholdFee: true,
		});

		expect(plan).toMatchObject({ grossInCents: 1_000_000, feeInCents: 200_000, netInCents: 800_000 });
	});

	it('never goes below zero when the fee covers the whole rule amount', () => {
		const plan = planGuestRefund({
			payments: fiveGuestsByCard(),
			guests: 1,
			unitPriceInCents: 1_000_000,
			percentage: 5,
			withholdFee: true,
		});

		expect(plan).toMatchObject({ grossInCents: 50_000, netInCents: 0, parts: [] });
	});

	it('refunds in full without the fee when asked to', () => {
		const plan = planGuestRefund({
			payments: fiveGuestsByCard(),
			guests: 5,
			unitPriceInCents: 1_000_000,
			percentage: 100,
			withholdFee: false,
		});

		expect(plan.netInCents).toBe(5_000_000);
	});

	it('takes the newest card payment first and never refunds more than was left on a payment', () => {
		const payments = readPayments([
			row({ type: 'CHARGE', amount: 30000, feeAmount: 3000 }),
			row({
				type: 'CHARGE',
				amount: 10000,
				feeAmount: 1000,
				stripePaymentIntentId: 'pi_2',
				createdAt: day(3),
			}),
		]);

		const plan = planGuestRefund({
			payments,
			guests: 2,
			unitPriceInCents: 1_000_000,
			percentage: 100,
			withholdFee: false,
		});

		expect(plan.parts).toEqual([
			{ paymentIntentId: 'pi_2', amountInCents: 1_000_000 },
			{ paymentIntentId: 'pi_1', amountInCents: 1_000_000 },
		]);
	});

	it('plans a cash refund for a booking paid in person', () => {
		const plan = planGuestRefund({
			payments: readPayments([row({ type: 'CHARGE', amount: 30000, stripePaymentIntentId: null })]),
			guests: 1,
			unitPriceInCents: 1_000_000,
			percentage: 100,
			withholdFee: true,
		});

		expect(plan).toMatchObject({ paidByCard: false, feeInCents: 0, netInCents: 1_000_000 });
		expect(plan.parts).toEqual([{ paymentIntentId: null, amountInCents: 1_000_000 }]);
	});
});
