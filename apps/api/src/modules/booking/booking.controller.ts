import {
	Controller,
	Post,
	Get,
	Patch,
	Param,
	Query,
	Body,
	UseGuards,
	Ip,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiParam,
	ApiResponse,
	ApiBody,
	ApiQuery,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { OptionalAccessTokenGuard } from '../auth/guards/optional-access-token.guard';
import {
	AppException,
	GetBrandHost,
	GetCurrentUserId,
	GetLocale,
	GetOptionalUserId,
	ZodValidationPipe,
	parseOptionalQueryInt,
} from '@shared';
import {
	AppErrorCode,
	BookingDisplayStatusEnum,
	ChangeQuantitySchema,
	CreateBookingSchema,
	CreateGuestBookingSchema,
	QuantityQuoteRequestSchema,
} from '@event-space/shared';
import { BOOKING_CONFIG } from '@event-space/shared/constants';
import type {
	BookingDisplayStatus,
	ChangeQuantityData,
	CreateBookingData,
	CreateGuestBookingData,
	QuantityQuoteRequest,
} from '@event-space/shared';
import type { Locale } from '@prisma/client';
import { getReference } from '@infra/swagger/swagger.utils';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';

/** An unknown status is dropped rather than refused: the list simply comes back unfiltered. */
function parseBookingDisplayStatus(value?: string): BookingDisplayStatus | undefined {
	return value && BookingDisplayStatusEnum.options.includes(value as BookingDisplayStatus)
		? (value as BookingDisplayStatus)
		: undefined;
}

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
	constructor(
		private readonly bookingService: BookingService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@Post()
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Book an event' })
	@ApiResponse({
		status: 201,
		description: 'Booking created successfully',
	})
	@ApiResponse({ status: 404, description: 'Event not found' })
	@ApiResponse({ status: 409, description: 'Already booked or event full' })
	@ApiResponse({ status: 429, description: 'Too many booking attempts' })
	@ApiBody(getReference('CreateBookingSchema'))
	async create(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(CreateBookingSchema)) data: CreateBookingData,
		@GetLocale() locale: Locale | undefined,
		@GetBrandHost() brandHost: string | undefined,
	) {
		// Rate limit: max 10 booking attempts per minute
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:create`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_MAX_PER_MINUTE,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_WINDOW_SEC,
		);
		return this.bookingService.create(userId, data, locale, brandHost);
	}

	@Post('guest')
	@ApiOperation({ summary: 'Book an event without an account' })
	@ApiResponse({ status: 201, description: 'Booking created, with the key to it' })
	@ApiResponse({ status: 409, description: 'The email belongs to an account, or already booked, or event full' })
	@ApiResponse({ status: 429, description: 'Too many booking attempts' })
	@ApiBody(getReference('CreateGuestBookingSchema'))
	async createGuest(
		@Body(new ZodValidationPipe(CreateGuestBookingSchema)) data: CreateGuestBookingData,
		@Ip() ip: string,
		@GetLocale() locale: Locale | undefined,
		@GetBrandHost() brandHost: string | undefined,
	) {
		// There is no account to count against, so the address and the email are the keys.
		await Promise.all([
			this.rateLimiter.consumePerUser(
				`${BOOKING_CONFIG.KEY_PREFIX}:guest-ip`,
				ip,
				BOOKING_CONFIG.RATE_LIMITS.CREATE_MAX_PER_MINUTE,
				BOOKING_CONFIG.RATE_LIMITS.CREATE_WINDOW_SEC,
			),
			this.rateLimiter.consumePerUser(
				`${BOOKING_CONFIG.KEY_PREFIX}:guest-email`,
				data.email.trim().toLowerCase(),
				BOOKING_CONFIG.RATE_LIMITS.CREATE_MAX_PER_MINUTE,
				BOOKING_CONFIG.RATE_LIMITS.CREATE_WINDOW_SEC,
			),
		]);
		return this.bookingService.createGuest(data, locale, brandHost);
	}

	@Get('my')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Get a page of my bookings, newest first' })
	@ApiQuery({ name: 'cursor', required: false, description: 'nextCursor of the previous page' })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	@ApiQuery({ name: 'status', required: false, enum: BookingDisplayStatusEnum.options })
	async findMy(
		@GetCurrentUserId() userId: string,
		@Query('cursor') cursor?: string,
		@Query('limit') limit?: string,
		@Query('status') status?: string,
	) {
		return this.bookingService.findByUser(userId, {
			cursor,
			limit: parseOptionalQueryInt(limit, 'limit'),
			status: parseBookingDisplayStatus(status),
		});
	}

	@Get('my/summary')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Counters the site needs on every page' })
	@ApiResponse({ status: 200, description: 'Active booking count and the dates already held' })
	async myBookingsSummary(@GetCurrentUserId() userId: string) {
		return this.bookingService.summaryForUser(userId);
	}

	@Get(':id/view')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'A booking in full, by sign-in or by the link from its email' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiResponse({ status: 200, description: 'Booking with the refund it would get today' })
	async view(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		return this.bookingService.findOneDetailed(actorId, id);
	}

	@Get(':id')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Get booking by ID' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking details' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async findOne(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		return this.bookingService.findOneForUser(actorId, id);
	}

	@Patch(':id/cancel')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Cancel booking' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	@ApiResponse({ status: 429, description: 'Too many cancellation attempts' })
	async cancel(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@GetLocale() locale: Locale | undefined,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		// Rate limit: max 30 cancellation attempts per hour
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:cancel`,
			actorId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.cancel(actorId, id, locale);
	}

	@Post(':id/resend-confirmation')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Send the confirmation letter again' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiResponse({ status: 201, description: 'Whether the letter went out' })
	@ApiResponse({ status: 429, description: 'Too many attempts' })
	async resendConfirmation(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@GetLocale() locale: Locale | undefined,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		// A letter costs money and can be aimed at someone's inbox, so it is rationed per booking.
		await this.rateLimiter.consumePerUser(`${BOOKING_CONFIG.KEY_PREFIX}:resend`, id, 3, 3600);
		return this.bookingService.resendConfirmation(actorId, id, locale);
	}

	@Patch(':id/accept-reschedule')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiOperation({ summary: 'Confirm the moved tour date suits the client' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'The extra refund right is given up' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async acceptReschedule(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		return this.bookingService.acceptReschedule(actorId, id);
	}

	@Post(':id/quantity/quote')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiOperation({ summary: 'Show what changing the number of guests would refund' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiBody(getReference('QuantityQuoteRequestSchema'))
	@ApiResponse({ status: 200, description: 'The refund for the new number of guests' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async quoteQuantity(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(QuantityQuoteRequestSchema)) data: QuantityQuoteRequest,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		return this.bookingService.quoteQuantity({ kind: 'client', userId: actorId }, id, data);
	}

	@Patch(':id/quantity')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiOperation({ summary: 'Change the number of guests and get the refund for the removed ones' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiBody(getReference('ChangeQuantitySchema'))
	@ApiResponse({ status: 200, description: 'Booking changed' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	@ApiResponse({
		status: 409,
		description: 'The refund changed or the booking was changed meanwhile',
	})
	@ApiResponse({ status: 429, description: 'Too many attempts' })
	async changeQuantity(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(ChangeQuantitySchema)) data: ChangeQuantityData,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:quantity`,
			actorId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.changeQuantity({ kind: 'client', userId: actorId }, id, data);
	}

	@Post(':id/quantity/payment')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiOperation({ summary: 'Start paying for more guests in a booking' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiBody(getReference('QuantityQuoteRequestSchema'))
	@ApiResponse({ status: 201, description: 'The payment to complete for the added guests' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	@ApiResponse({ status: 429, description: 'Too many attempts' })
	async startQuantityPayment(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(QuantityQuoteRequestSchema)) data: QuantityQuoteRequest,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:quantity-payment`,
			actorId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.startQuantityPayment(actorId, id, data);
	}

	@Post(':id/quantity/payments/:paymentIntentId/reconcile')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiOperation({ summary: 'Check whether the payment for more guests went through' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiParam({ name: 'paymentIntentId', description: 'Stripe payment for the added guests' })
	async reconcileQuantityPayment(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@Param('paymentIntentId') paymentIntentId: string,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		return this.bookingService.reconcileQuantityPayment(actorId, id, paymentIntentId);
	}

	@Post(':id/reconcile-payment')
	@UseGuards(OptionalAccessTokenGuard)
	@ApiOperation({ summary: 'Reconcile booking payment status' })
	@ApiQuery({ name: 't', required: false, description: 'Signed link from the booking email' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking payment reconciled successfully' })
	@ApiResponse({ status: 400, description: 'Booking has no payment intent to reconcile' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async reconcilePayment(
		@GetOptionalUserId() userId: string | undefined,
		@Param('id') id: string,
		@GetLocale() locale: Locale | undefined,
		@Query('t') token?: string,
	) {
		const actorId = await this.bookingService.resolveActor(id, userId, token);
		const booking = await this.bookingService.findOneForUser(actorId, id);
		if (!booking.paymentIntentId) {
			throw new AppException(AppErrorCode.BOOKING_NO_PAYMENT_INTENT);
		}
		return this.bookingService.reconcilePayment(booking.paymentIntentId, booking.id, locale);
	}

	// @Patch(':id')
	// @ApiBearerAuth()
	// @UseGuards(AccessTokenGuard)
	// @ApiOperation({ summary: 'Update booking quantity' })
	// @ApiParam({ name: 'id', description: 'Booking ID' })
	// @ApiResponse({ status: 200, description: 'Booking updated successfully' })
	// @ApiResponse({ status: 404, description: 'Booking not found' })
	// @ApiResponse({ status: 403, description: 'Not your booking' })
	// @ApiResponse({ status: 409, description: 'Not enough spots available' })
	// @ApiBody(getReference('UpdateBookingSchema'))
	// update(
	// 	@GetCurrentUserId() userId: string,
	// 	@Param('id') id: string,
	// 	@Body(new ZodValidationPipe(UpdateBookingSchema)) data: UpdateBookingData,
	// ) {
	// 	return this.bookingService.update(userId, id, data);
	// }
}
