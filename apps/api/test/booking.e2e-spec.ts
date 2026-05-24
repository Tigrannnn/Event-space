import supertest from 'supertest';
import { createE2eApp, destroyE2eApp, E2eContext } from './helpers/e2e-app';
import {
	registerVerifyAndLogin,
	uniqueEmail,
} from './helpers/auth-test.utils';
import { createTestEvent } from './helpers/seed-event';
import { EventStatus } from '@prisma/client';

describe('Booking (e2e)', () => {
	let ctx: E2eContext;
	let organizerId: string;
	beforeAll(async () => {
		ctx = await createE2eApp();

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
		it('creates a confirmed booking and increments participants', async () => {
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

			expect(res.body.status).toBe('CONFIRMED');
			expect(res.body.quantity).toBe(2);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(2);
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

		it('allows only one winner when two users book the last spot concurrently', async () => {
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
			expect(statuses).toEqual([201, 409]);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(1);

			const confirmed = await ctx.prisma.booking.count({
				where: { eventId: event.id, status: 'CONFIRMED' },
			});
			expect(confirmed).toBe(1);
		});
	});

	describe('PATCH /bookings/:id', () => {
		it('increases quantity when spots are available', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId, {
				maxParticipants: 5,
			});
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('update-qty'),
			);

			const created = await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);

			await supertest(ctx.httpServer)
				.patch(`/bookings/${created.body.id}`)
				.set('Cookie', cookies)
				.send({ quantity: 3 })
				.expect(200);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(3);
		});

		it('returns 409 when increasing beyond capacity', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId, {
				maxParticipants: 2,
			});
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('over-cap'),
			);

			const created = await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 2 })
				.expect(201);

			await supertest(ctx.httpServer)
				.patch(`/bookings/${created.body.id}`)
				.set('Cookie', cookies)
				.send({ quantity: 3 })
				.expect(409);
		});
	});

	describe('PATCH /bookings/:id/cancel', () => {
		it('cancels booking and releases capacity', async () => {
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

			await supertest(ctx.httpServer)
				.patch(`/bookings/${created.body.id}/cancel`)
				.set('Cookie', cookies)
				.expect(200);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(0);

			const booking = await ctx.prisma.booking.findUniqueOrThrow({
				where: { id: created.body.id },
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

			await supertest(ctx.httpServer)
				.patch(`/bookings/${created.body.id}/cancel`)
				.set('Cookie', cookies)
				.expect(200);

			await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);

			const updated = await ctx.prisma.event.findUniqueOrThrow({ where: { id: event.id } });
			expect(updated.currentParticipants).toBe(1);
		});
	});

	describe('GET /bookings/my', () => {
		it('lists active bookings for the current user', async () => {
			const event = await createTestEvent(ctx.prisma, organizerId);
			const { cookies } = await registerVerifyAndLogin(
				ctx.httpServer,
				ctx.prisma,
				ctx.redis,
				uniqueEmail('my-list'),
			);

			await supertest(ctx.httpServer)
				.post('/bookings')
				.set('Cookie', cookies)
				.send({ eventId: event.id, quantity: 1 })
				.expect(201);

			const res = await supertest(ctx.httpServer)
				.get('/bookings/my')
				.set('Cookie', cookies)
				.expect(200);

			expect(res.body).toHaveLength(1);
			expect(res.body[0].eventId).toBe(event.id);
		});
	});
});
