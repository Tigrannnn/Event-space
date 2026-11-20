import { toPaymentMix } from './dashboard-flow.service';

const at = new Date('2026-11-10T10:00:00Z');

describe('toPaymentMix', () => {
	it('splits bookings made in the period by how they pay and keeps cancelled ones apart', () => {
		const mix = toPaymentMix({
			bookings: [
				{ createdAt: at, status: 'CONFIRMED', paymentMethod: 'SITE_PAYMENT', quantity: 2, amount: '20000' },
				{ createdAt: at, status: 'CONFIRMED', paymentMethod: 'SITE_PAYMENT', quantity: 1, amount: '10000.5' },
				{ createdAt: at, status: 'CONFIRMED', paymentMethod: 'PAY_ON_ARRIVAL', quantity: 3, amount: '30000' },
				{ createdAt: at, status: 'CANCELLED', paymentMethod: 'SITE_PAYMENT', quantity: 1, amount: '15000' },
				{ createdAt: at, status: 'PENDING', paymentMethod: 'SITE_PAYMENT', quantity: 4, amount: '40000' },
			],
		});

		expect(mix.methods).toEqual([
			{ method: 'SITE_PAYMENT', bookings: 2, guests: 3, amount: 30000.5 },
			{ method: 'OFFLINE_PAID', bookings: 0, guests: 0, amount: 0 },
			{ method: 'PAY_ON_ARRIVAL', bookings: 1, guests: 3, amount: 30000 },
		]);
		expect(mix.cancelled).toEqual({ bookings: 1, amount: 15000 });
	});
});
