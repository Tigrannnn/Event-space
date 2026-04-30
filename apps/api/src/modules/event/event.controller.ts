import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
	DefaultValuePipe,
	ParseIntPipe,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBearerAuth,
	ApiBody,
} from '@nestjs/swagger';
import { CreateEventSchema, UserRoleSchema } from '@event-space/shared';
import type { CreateEventData, UpdateEventData, UserRoleType } from '@event-space/shared';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUser, GetCurrentUserId, Roles, RolesGuard, ZodValidationPipe } from '@shared';
import { getReference } from '@infra/swagger/swagger.utils';

@ApiTags('events')
@Controller('events')
export class EventController {
	constructor(private readonly eventService: EventService) {}

	@Get()
	@ApiOperation({ summary: 'Get events with cursor pagination and search' })
	@ApiResponse({ status: 200, description: 'Returns paginated events' })
	findAll(
		@Query('cursor') cursor?: string,
		@Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number = 8,
		@Query('search') search?: string,
	) {
		const safeLimit = Math.min(limit, 20);
		return this.eventService.findAll(cursor, safeLimit, search);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get event by ID' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	@ApiResponse({ status: 200, description: 'Event found' })
	@ApiResponse({ status: 404, description: 'Event not found' })
	findOne(@Param('id') id: string) {
		return this.eventService.findOne(id);
	}

	@Post()
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ORGANIZER, UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Create a new event' })
	@ApiResponse({ status: 201, description: 'Event successfully created' })
	@ApiBody(getReference('CreateEventSchema'))
	create(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(CreateEventSchema)) data: CreateEventData,
	) {
		return this.eventService.create(userId, data);
	}

	@Put(':id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ORGANIZER, UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Update an event' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	@ApiResponse({ status: 200, description: 'Event successfully updated' })
	@ApiBody(getReference('UpdateEventSchema'))
	update(
		@Param('id') id: string,
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('role') role: UserRoleType,
		@Body() data: UpdateEventData,
	) {
		return this.eventService.update(id, userId, role, data);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ORGANIZER, UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Delete an event' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	@ApiResponse({ status: 200, description: 'Event successfully deleted' })
	delete(
		@Param('id') id: string,
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('role') role: UserRoleType,
	) {
		return this.eventService.delete(id, userId, role);
	}
}
