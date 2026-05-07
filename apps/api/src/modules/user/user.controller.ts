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
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserSchema } from '@event-space/shared';
import type { SafeUserData, UpdateUserData, MessageResponse } from '@event-space/shared';
import { GetCurrentUserId, ZodValidationPipe } from '@shared';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { getReference } from '@infra/swagger/swagger.utils';

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

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
	@ApiBody(getReference('UpdateUserSchema'))
	async updateMe(
		@GetCurrentUserId() userId: string,
		@Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUserData,
	): Promise<SafeUserData> {
		return this.userService.updateMe(userId, data);
	}

	@UseGuards(AccessTokenGuard)
	@Delete('me')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Delete current user account' })
	@ApiBearerAuth()
	async deleteMe(
		@GetCurrentUserId() userId: string,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<MessageResponse> {
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
