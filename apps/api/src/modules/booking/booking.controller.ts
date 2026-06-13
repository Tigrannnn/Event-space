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
import { GetCurrentUserId, ZodValidationPipe } from '@shared';
import { CreateBookingSchema } from '@event-space/shared';
import { BOOKING_CONFIG } from '@event-space/shared/constants';
import type { BookingWithEstimate, CreateBookingData } from '@event-space/shared';
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
	) {
		// Rate limit: max 10 booking attempts per minute
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:create`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_MAX_PER_MINUTE,
			BOOKING_CONFIG.RATE_LIMITS.CREATE_WINDOW_SEC,
		);
		return this.bookingService.create(userId, data);
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
	async cancel(@GetCurrentUserId() userId: string, @Param('id') id: string) {
		// Rate limit: max 30 cancellation attempts per hour
		await this.rateLimiter.consumePerUser(
			`${BOOKING_CONFIG.KEY_PREFIX}:cancel`,
			userId,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_MAX_PER_HOUR,
			BOOKING_CONFIG.RATE_LIMITS.CANCEL_WINDOW_SEC,
		);
		return this.bookingService.cancel(userId, id);
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
