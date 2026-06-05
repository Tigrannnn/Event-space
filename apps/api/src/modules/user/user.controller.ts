import {
	Controller,
	Get,
	Delete,
	Patch,
	Body,
	Res,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UpdateUserSchema } from '@event-space/shared';
import { ADMIN_CONFIG } from '@event-space/shared/constants';
import type { SafeUserData, UpdateUserData, MessageResponse } from '@event-space/shared';
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

	@UseGuards(AccessTokenGuard)
	@Delete('me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete current user account' })
	@ApiBearerAuth()
	@ApiResponse({ status: 429, description: 'Too many deletion attempts' })
	async deleteMe(
		@GetCurrentUserId() userId: string,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<MessageResponse> {
		// Rate limit account deletion attempts
		await this.rateLimiter.consumePerUser(
			`${ADMIN_CONFIG.KEY_PREFIX}:self_delete`,
			userId,
			5, // Max 5 deletion attempts per hour
			3600,
		);

		await this.userService.deleteMe(userId);

		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
		});
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
		});

		return { message: 'Account deleted successfully' };
	}
}
