import { createAdmin, fakePrisma, fakeStripe } from '../admin.test-helpers';

function admin(prisma: ReturnType<typeof fakePrisma>) {
	return createAdmin(prisma.prisma, fakeStripe().stripe);
}

const payOnArrival = {
	id: 'b1',
	status: 'CONFIRMED',
	paymentMethod: 'PAY_ON_ARRIVAL',
	amount: '30000',
	channelId: 'ch-1',
	createdByAdminId: 'admin-1',
};

describe('marking a pay-on-arrival booking as paid', () => {
	it('switches it to paid offline and writes the cash into the ledger', async () => {
		const world = fakePrisma({ 'booking.findUnique': payOnArrival });
		await admin(world).markBookingPaid('b1');

		expect(world.argsOf('booking.updateMany')[0]).toMatchObject({
			where: { id: 'b1', status: 'CONFIRMED', paymentMethod: 'PAY_ON_ARRIVAL' },
			data: { paymentMethod: 'OFFLINE_PAID' },
		});
		expect(world.argsOf('bookingAdjustment.create')[0]).toMatchObject({
			data: { bookingId: 'b1', type: 'CHARGE', stripePaymentIntentId: null, status: 'SUCCEEDED' },
		});
		expect(
			String(
				(world.argsOf('bookingAdjustment.create')[0] as { data: { amount: unknown } }).data.amount,
			),
		).toBe('30000');
	});

	it('refuses a booking that is not waiting for payment on arrival', async () => {
		const world = fakePrisma({
			'booking.findUnique': { ...payOnArrival, paymentMethod: 'OFFLINE_PAID' },
			'booking.updateMany': { count: 0 },
		});

		await expect(admin(world).markBookingPaid('b1')).rejects.toMatchObject({
			code: 'BOOKING_NOT_PAY_ON_ARRIVAL',
		});
		expect(world.argsOf('bookingAdjustment.create')).toHaveLength(0);
	});
});

describe('fixing where a manual booking was sold', () => {
	it('saves the new number and clears an empty one', async () => {
		const world = fakePrisma({ 'booking.findUnique': payOnArrival });
		await admin(world).updateBookingChannel('b1', { channelId: 'ch-1', externalId: '  ' });

		expect(world.argsOf('booking.update')[0]).toMatchObject({
			where: { id: 'b1' },
			data: { channelId: 'ch-1', externalId: null },
		});
		expect(world.argsOf('channel.findUnique')).toHaveLength(0);
	});

	it('checks a new channel can take bookings', async () => {
		const world = fakePrisma({
			'booking.findUnique': payOnArrival,
			'channel.findUnique': { id: 'ch-2', isActive: false, forBookings: true },
		});

		await expect(
			admin(world).updateBookingChannel('b1', { channelId: 'ch-2', externalId: null }),
		).rejects.toMatchObject({ code: 'CHANNEL_NOT_AVAILABLE' });
		expect(world.argsOf('booking.update')).toHaveLength(0);
	});

	it('refuses a number another booking on that platform already has', async () => {
		const world = fakePrisma({
			'booking.findUnique': (args: { where: { id?: string } }) =>
				args.where.id ? payOnArrival : { id: 'b2' },
		});

		await expect(
			admin(world).updateBookingChannel('b1', { channelId: 'ch-1', externalId: 'GYG-1' }),
		).rejects.toMatchObject({ code: 'BOOKING_EXTERNAL_ID_TAKEN' });
	});

	it('leaves bookings made on the site alone', async () => {
		const world = fakePrisma({ 'booking.findUnique': { ...payOnArrival, createdByAdminId: null } });

		await expect(
			admin(world).updateBookingChannel('b1', { channelId: 'ch-1', externalId: null }),
		).rejects.toMatchObject({ code: 'BOOKING_NOT_MANUAL' });
	});
});
