import { AdminController } from './admin.controller';

describe('admin creating a booking for a client', () => {
	it('hands the language and the site brand on, so the client’s email is not generic', async () => {
		const createManualBooking = jest.fn().mockResolvedValue({ id: 'b1' });
		const controller = Object.create(AdminController.prototype) as AdminController;
		Object.assign(controller, {
			bookingService: { createManualBooking },
			rateLimiter: { consumePerUser: () => Promise.resolve() },
		});

		const data = { occurrenceId: 'o1', paymentMethod: 'OFFLINE_PAID' };
		await controller.createManualBooking('admin1', data as never, 'hy', 'dilitour.event-space.space');

		expect(createManualBooking).toHaveBeenCalledWith(
			'admin1',
			data,
			'hy',
			'dilitour.event-space.space',
		);
	});
});
