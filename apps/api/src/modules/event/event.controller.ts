import {
	BadRequestException,
	Controller,
	Get,
	Post,
	Put,
	Patch,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
	DefaultValuePipe,
	ParseIntPipe,
	UseInterceptors,
	UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventService } from './event.service';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
} from '@nestjs/swagger';
import { EventStatusEnum, MAX_EVENT_IMAGES, UserRoleSchema } from '@event-space/shared';
import type { EventStatus, UserRoleType } from '@event-space/shared';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { GetCurrentUser, GetCurrentUserId, Roles, RolesGuard } from '@shared';
import {
	parseCreateEventMultipart,
	parseUpdateEventMultipart,
} from './mappers/event-multipart.mapper';
import { eventImageUploadOptions } from './event-upload.options';
import { RateLimitEventMutation } from './decorators/rate-limit-event-mutation.decorator';
import { EventMutationRateLimitGuard } from './guards/event-mutation-rate-limit.guard';

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
	@Roles(UserRoleSchema.enum.ADMIN)
	@RateLimitEventMutation('create')
	@UseGuards(AccessTokenGuard, RolesGuard, EventMutationRateLimitGuard)
	@UseInterceptors(FilesInterceptor('files', MAX_EVENT_IMAGES, eventImageUploadOptions))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Create a new event with images' })
	@ApiResponse({ status: 201, description: 'Event successfully created' })
	@ApiResponse({ status: 429, description: 'Too many create requests' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['payload'],
			properties: {
				payload: {
					type: 'string',
					description: 'JSON: event fields + images[] ({ kind: "file", order })',
				},
				files: {
					type: 'array',
					items: { type: 'string', format: 'binary' },
					description: 'New image files in the same order as file items in payload.images',
				},
			},
		},
	})
	create(
		@GetCurrentUserId() userId: string,
		@Body('payload') payload: string,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		const parsed = parseCreateEventMultipart(payload, files);
		return this.eventService.create(userId, parsed.eventData, parsed.imageItems, parsed.files);
	}

	@Patch(':id/status')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Update event status only' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	updateStatus(
		@Param('id') id: string,
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('role') role: UserRoleType,
		@Body('status') status: EventStatus,
	) {
		if (!EventStatusEnum.options.includes(status)) {
			throw new BadRequestException('Invalid status');
		}
		return this.eventService.updateStatus(id, userId, role, status);
	}

	@Put(':id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
	@RateLimitEventMutation('update')
	@UseGuards(AccessTokenGuard, RolesGuard, EventMutationRateLimitGuard)
	@UseInterceptors(FilesInterceptor('files', MAX_EVENT_IMAGES, eventImageUploadOptions))
	@ApiConsumes('multipart/form-data')
	@ApiOperation({ summary: 'Update an event with images' })
	@ApiParam({ name: 'id', description: 'Event ID' })
	@ApiResponse({ status: 200, description: 'Event successfully updated' })
	@ApiResponse({ status: 429, description: 'Too many update requests' })
	@ApiBody({
		schema: {
			type: 'object',
			required: ['payload'],
			properties: {
				payload: {
					type: 'string',
					description: 'JSON: partial event fields + images[] ({ kind: "existing"|"file", order, id? })',
				},
				files: {
					type: 'array',
					items: { type: 'string', format: 'binary' },
					description: 'New image files in the same order as file items in payload.images',
				},
			},
		},
	})
	update(
		@Param('id') id: string,
		@GetCurrentUserId() userId: string,
		@GetCurrentUser('role') role: UserRoleType,
		@Body('payload') payload: string,
		@UploadedFiles() files?: Express.Multer.File[],
	) {
		const parsed = parseUpdateEventMultipart(payload, files);
		return this.eventService.update(
			id,
			userId,
			role,
			parsed.eventData,
			parsed.imageItems,
			parsed.files,
		);
	}

	@Delete(':id')
	@ApiBearerAuth()
	@Roles(UserRoleSchema.enum.ADMIN)
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
