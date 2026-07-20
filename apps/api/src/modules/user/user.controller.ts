import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserSchema } from '@event-space/shared';
import type { SafeUserData, UpdateUserData } from '@event-space/shared';
import { GetCurrentUserId, ZodValidationPipe } from '@shared';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { getReference } from '@infra/swagger/swagger.utils';

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(
		private userService: UserService,
		private readonly rateLimiter: RateLimiterService,
	) {}

	@UseGuards(AccessTokenGuard)
	@Get('me')
	@ApiOperation({ summary: 'Get profile of current user' })
	@ApiBearerAuth()
	async getMe(@GetCurrentUserId() userId: string): Promise<SafeUserData> {
		return this.userService.getMe(userId);
	}

	@UseGuards(AccessTokenGuard)
	@Patch('me')
	@ApiOperation({ summary: 'Update current user profile' })
	@ApiBearerAuth()
	@ApiResponse({ status: 429, description: 'Too many profile update attempts' })
	@ApiBody(getReference('UpdateUserSchema'))
	async updateMe(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUserData,
	): Promise<SafeUserData> {
		// Rate limit profile updates: max 30 per hour
		await this.rateLimiter.consumePerUser(`user:profile_update`, userId, 30, 3600);
		return this.userService.updateMe(userId, data);
	}
}
