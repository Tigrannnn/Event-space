import {
	Controller,
	Get,
	Post,
	Delete,
	Patch,
	Body,
	Param,
	Res,
	UseGuards,
	UsePipes,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { UserService } from './user.service';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterSchema, UpdateUserSchema, UserRoleSchema, AUTH_CONFIG } from '@event-space/shared';
import type {
	RegisterData,
	SafeUserData,
	UpdateUserData,
	MessageResponse,
} from '@event-space/shared';
import { GetCurrentUserId, Roles, RolesGuard, ZodValidationPipe } from '@shared';
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

	@Get()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: 'Returns a list of all users' })
	findAll() {
		return this.userService.findAll();
	}

	@Get(':id')
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Get user by ID' })
	@ApiParam({ name: 'id', description: 'User ID' })
	@ApiResponse({ status: 200, description: 'User found' })
	@ApiResponse({ status: 404, description: 'User not found' })
	findOne(@Param('id') id: string) {
		return this.userService.findOne(id);
	}

	@Post()
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Create a new user' })
	@ApiResponse({ status: 201, description: 'User successfully created' })
	@ApiBody(getReference('CreateUserSchema'))
	create(@Body(new ZodValidationPipe(RegisterSchema)) data: RegisterData) {
		return this.userService.create(data);
	}

	@Delete(':id')
	@Roles(UserRoleSchema.enum.ADMIN)
	@UseGuards(AccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'Delete a user' })
	@ApiParam({ name: 'id', description: 'User ID' })
	@ApiResponse({ status: 200, description: 'User successfully deleted' })
	delete(@Param('id') id: string) {
		return this.userService.delete(id);
	}
}
