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
import { CreateBookingSchema, UpdateBookingSchema } from '@event-space/shared';
import type { CreateBookingData, UpdateBookingData } from '@event-space/shared';
import { getReference } from '@infra/swagger/swagger.utils';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
	constructor(private readonly bookingService: BookingService) {}

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
	@ApiBody(getReference('CreateBookingSchema'))
	create(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(CreateBookingSchema)) data: CreateBookingData,
	) {
		return this.bookingService.create(userId, data);
	}

	@Get('my')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Get my bookings' })
	@ApiResponse({ status: 200, description: 'List of user bookings' })
	findMy(@GetCurrentUserId() userId: string) {
		return this.bookingService.findByUser(userId);
	}

	@Patch(':id/cancel')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Cancel booking' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	cancel(@GetCurrentUserId() userId: string, @Param('id') id: string) {
		return this.bookingService.cancel(userId, id);
	}

	@Patch(':id')
	@ApiBearerAuth()
	@UseGuards(AccessTokenGuard)
	@ApiOperation({ summary: 'Update booking quantity' })
	@ApiParam({ name: 'id', description: 'Booking ID' })
	@ApiResponse({ status: 200, description: 'Booking updated successfully' })
	@ApiResponse({ status: 404, description: 'Booking not found' })
	@ApiResponse({ status: 403, description: 'Not your booking' })
	@ApiResponse({ status: 409, description: 'Not enough spots available' })
	@ApiBody(getReference('UpdateBookingSchema'))
	update(
		@GetCurrentUserId() userId: string,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(UpdateBookingSchema)) data: UpdateBookingData,
	) {
		return this.bookingService.update(userId, id, data);
	}
}
