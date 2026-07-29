import { Controller, Post, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '@modules/auth/guards';
import { GetCurrentUserId } from '@shared';

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
	findAll(@GetCurrentUserId() userId: string) {
		return this.favoritesService.findAllForUser(userId);
	}

	@Delete(':eventId')
	remove(@GetCurrentUserId() userId: string, @Param('eventId') eventId: string) {
		return this.favoritesService.remove(userId, eventId);
	}
}
