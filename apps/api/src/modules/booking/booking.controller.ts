import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiParam,
	ApiResponse,
	ApiBody,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import {
	AppException,
	GetBrandHost,
	GetCurrentUserId,
	GetLocale,
	ZodValidationPipe,
} from '@shared';
import {
	AppErrorCode,
	ChangeQuantitySchema,
	CreateBookingSchema,
	QuantityQuoteRequestSchema,
} from '@event-space/shared';
import { BOOKING_CONFIG } from '@event-space/shared/constants';
import type {
	BookingWithEstimate,
	ChangeQuantityData,
	CreateBookingData,
	QuantityQuoteRequest,
} from '@event-space/shared';
import type { Locale } from '@prisma/client';
import { getReference } from '@infra/swagger/swagger.utils';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';

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

	@Get('my')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Get my bookings' })
	@ApiResponse({ status: 200, description: 'List of user bookings with refund estimates' })
	async findMy(@GetCurrentUserId() userId: string): Promise<BookingWithEstimate[]> {
		return this.bookingService.findByUser(userId);
	}

	@Get(':id')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Get booking by ID' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking details' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async findOne(@GetCurrentUserId() userId: string, @Param('id') id: string) {
		return this.bookingService.findOneForUser(userId, id);
	}

	@Patch(':id/cancel')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Cancel booking' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	@ApiResponse({ status: 429, description: 'Too many cancellation attempts' })
	async cancel(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@GetLocale() locale: Locale | undefined,
	) {
		// Rate limit: max 30 cancellation attempts per hour
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:cancel`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.cancel(userId, id, locale);
	}

	@Post(':id/quantity/quote')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Show what changing the number of guests would refund' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiBody(getReference('QuantityQuoteRequestSchema'))
	@ApiResponse({ status: 200, description: 'The refund for the new number of guests' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async quoteQuantity(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(QuantityQuoteRequestSchema)) data: QuantityQuoteRequest,
	) {
		return this.bookingService.quoteQuantity({ kind: 'client', userId }, id, data);
	}

	@Patch(':id/quantity')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
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
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(ChangeQuantitySchema)) data: ChangeQuantityData,
	) {
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:quantity`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.changeQuantity({ kind: 'client', userId }, id, data);
	}

	@Post(':id/quantity/payment')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Start paying for more guests in a booking' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiBody(getReference('QuantityQuoteRequestSchema'))
	@ApiResponse({ status: 201, description: 'The payment to complete for the added guests' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	@ApiResponse({ status: 429, description: 'Too many attempts' })
	async startQuantityPayment(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(QuantityQuoteRequestSchema)) data: QuantityQuoteRequest,
	) {
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:quantity-payment`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.startQuantityPayment(userId, id, data);
	}

	@Post(':id/quantity/payments/:modificationId/reconcile')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Check whether the payment for more guests went through' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiParam({ name: 'modificationId', description: 'Guest payment ID' })
	async reconcileQuantityPayment(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@Param('modificationId') modificationId: string,
	) {
		return this.bookingService.reconcileQuantityPayment(userId, id, modificationId);
	}

	@Post(':id/reconcile-payment')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Reconcile booking payment status' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking payment reconciled successfully' })
	@ApiResponse({ status: 400, description: 'Booking has no payment intent to reconcile' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	async reconcilePayment(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@GetLocale() locale: Locale | undefined,
	) {
		const booking = await this.bookingService.findOneForUser(userId, id);
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
