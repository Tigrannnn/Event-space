import supertest from 'supertest';
import { createE2eApp, destroyE2eApp, E2eContext } from './helpers/e2e-app';
import { registerVerifyAndLogin, uniqueEmail } from './helpers/auth-test.utils';
import { createTestEvent } from './helpers/seed-event';
import { EventStatus } from '@prisma/client';
import { StripeService } from '@infra/stripe/stripe.service';
import type { Booking, CreateBookingResponse } from '@event-space/shared';

describe('Booking (e2e)', () => {
	let ctx: E2eContext;
	let organizerId: string;
	let stripe: StripeService;
	beforeAll(async () => {
		ctx = await createE2eApp();
		stripe = ctx.app.get(StripeService);

		let paymentIntentCounter = 0;
		jest.spyOn(stripe, 'createPaymentIntent').mockImplementation(() => {
			paymentIntentCounter += 1;
			const id = `pi_test_booking_${paymentIntentCounter}`;
			return Promise.resolve({
				id,
				client_secret: `${id}_secret`,
			} as Awaited<ReturnType<StripeService['createPaymentIntent']>>);
		});
		jest.spyOn(stripe, 'retrievePaymentIntent').mockResolvedValue({
			id: 'pi_test_booking',
			status: 'requires_payment_method',
		} as Awaited<ReturnType<StripeService['retrievePaymentIntent']>>);
		jest.spyOn(stripe, 'cancelPaymentIntent').mockResolvedValue(undefined);

		const organizer = await registerVerifyAndLogin(
			ctx.httpServer,
			ctx.prisma,
			ctx.redis,
			uniqueEmail('organizer'),
		);
		organizerId = organizer.userId;
	});

	afterAll(async () => {
		await destroyE2eApp(ctx);
	});

	describe('POST /bookings', () => {
		it('creates a pending booking without reserving participants', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId, {
				maxParticipants: 5,
			});
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('booker'),
			);

			const res = await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 2 })
				.expect(201);

			const body = res.body as CreateBookingResponse;
			expect(body.clientSecret).toEqual(expect.stringMatching(/^pi_test_booking_\d+_secret$/));
			expect(body.booking.status).toBe('PENDING');
			expect(body.booking.quantity).toBe(2);
			expect(body.booking.expiresAt).toBeNull();

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(0);
		});

		it('returns 401 without authentication', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId);
			await supertest(ctx.httpServer)
				.post('/bookings')
				.send({ eventId: event.id, quantity: 1 })
				.expect(401);
		});

		it('returns 403 for non-published events', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId, {
				status: EventStatus.DRAFT,
			});
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('draft-booker'),
			);

			await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(403);
		});

		it('returns 409 when already booked', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId);
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('double-book'),
			);

			await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);

			await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(409);
		});

		it('allows concurrent pending bookings without reserving the last spot', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId, {
				maxParticipants: 1,
				currentParticipants: 0,
			});

			const userA = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('race-a'),
			);
			const userB = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('race-b'),
			);

			const [resA, resB] = await Promise.all([
				supertest(ctx.httpServer)
					.post('/bookings')
					.set('Cookie', userA.cookies)
					.send({ eventId: event.id, quantity: 1 }),
				supertest(ctx.httpServer)
					.post('/bookings')
					.set('Cookie', userB.cookies)
					.send({ eventId: event.id, quantity: 1 }),
			]);

			const statuses = [resA.status, resB.status].sort();
			expect(statuses).toEqual([201, 201]);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(0);

			const pending = await ctx.prisma.booking.count({
				where: { eventId: event.id, status: 'PENDING' },
			});
			expect(pending).toBe(2);
		});
	});

	describe('PATCH /bookings/:id/cancel', () => {
		it('cancels a pending booking without changing capacity', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId, {
				maxParticipants: 3,
			});
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('cancel-book'),
			);

			const created = await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 2 })
				.expect(201);
			const body = created.body as CreateBookingResponse;

			await supertest(ctx.httpServer)
				.patch(`/bookings/${body.booking.id}/cancel`)
				.set('Cookie', cookies)
				.expect(200);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(0);

			const booking = await ctx.prisma.booking.findUniqueOrThrow({
				where: { id: body.booking.id },
			});
			expect(booking.status).toBe('CANCELLED');
		});

		it('allows re-booking after cancel', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId);
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('rebook'),
			);

			const created = await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);
			const body = created.body as CreateBookingResponse;

			await supertest(ctx.httpServer)
				.patch(`/bookings/${body.booking.id}/cancel`)
				.set('Cookie', cookies)
				.expect(200);

			await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(0);
		});
	});

	describe('GET /bookings/my', () => {
		it('lists confirmed bookings for the current user', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId);
			const { cookies, userId } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('my-list'),
			);

			await ctx.prisma.booking.create({
				data: {
					userId,
					eventId: event.id,
					status: 'CONFIRMED',
					quantity: 1,
					amount: event.price,
					paymentIntentId: 'pi_confirmed_my_list',
				},
			});

			const res = await supertest(ctx.httpServer)
				.get('/bookings/my')
				.set('Cookie', cookies)
				.expect(200);

			expect(res.body).toHaveLength(1);
			const body = res.body as Booking[];
			expect(body[0].eventId).toBe(event.id);
		});
	});

	describe('GET /bookings/:id', () => {
		it('returns the current user booking for payment polling', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId);
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('poll-booking'),
			);

			const created = await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);
			const createdBody = created.body as CreateBookingResponse;

			const res = await supertest(ctx.httpServer)
				.get(`/bookings/${createdBody.booking.id}`)
				.set('Cookie', cookies)
				.expect(200);
			const body = res.body as Booking;

			expect(body.id).toBe(createdBody.booking.id);
			expect(body.status).toBe('PENDING');
		});
	});
});
