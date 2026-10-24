import { Controller, Post, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AccessTokenGuard } from '@modules/auth/guards';
import { GetCurrentUserId, parseOptionalQueryInt } from '@shared';

@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('favorites')
export class FavoritesController {
	constructor(private readonly favoritesService: FavoritesService) {}

	@Post(':eventId')
	add(@GetCurrentUserId() userId: string, @Param('eventId') eventId: string) {
		return this.favoritesService.add(userId, eventId);
	}

	@Get()
	@ApiOperation({ summary: 'A page of the events this visitor saved, newest first' })
	@ApiQuery({ name: 'cursor', required: false, description: 'nextCursor of the previous page' })
	@ApiQuery({ name: 'limit', required: false, type: Number })
	findAll(
		@GetCurrentUserId() userId: string,
		@Query('cursor') cursor?: string,
		@Query('limit') limit?: string,
	) {
		return this.favoritesService.findAllForUser(userId, {
			cursor,
			limit: parseOptionalQueryInt(limit, 'limit'),
		});
	}

	@Get('ids')
	@ApiOperation({ summary: 'Ids of every saved event — for the hearts and the counter' })
	findIds(@GetCurrentUserId() userId: string) {
		return this.favoritesService.findIdsForUser(userId);
	}

	@Delete(':eventId')
	remove(@GetCurrentUserId() userId: string, @Param('eventId') eventId: string) {
		return this.favoritesService.remove(userId, eventId);
	}
}
