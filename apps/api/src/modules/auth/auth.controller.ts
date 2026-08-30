import {
	Body,
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	Res,
	Req,
	Ip,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
	AUTH_CONFIG,
	AppErrorCode,
	ForgotPasswordSchema,
	GoogleLoginSchema,
	LoginSchema,
	RegisterSchema,
	ResendCodeSchema,
	ResetPasswordSchema,
	VerifyEmailSchema,
} from '@event-space/shared';
import type {
	AuthResponse,
	ForgotPasswordData,
	GoogleLoginData,
	LoginData,
	RegisterData,
	RegisterResponse,
	ResendCodeData,
	ResetPasswordData,
	VerifyEmailData,
} from '@event-space/shared';
import { AppException, GetCurrentUserId, ZodValidationPipe } from '@shared';
import { getReference } from '@infra/swagger/swagger.utils';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	private setAccessTokenCookie(res: express.Response, token: string) {
		res.cookie('accessToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: AUTH_CONFIG.ACCESS.ACCESS_TOKEN_EXPIRY_MS,
			path: '/',
		});
	}

	private clearAccessTokenCookie(res: express.Response) {
		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
		});
	}

	private setRefreshTokenCookie(res: express.Response, token: string) {
		res.cookie('refreshToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: AUTH_CONFIG.REFRESH.REFRESH_TOKEN_EXPIRY_MS,
			path: '/',
		});
	}

	private clearRefreshTokenCookie(res: express.Response) {
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/',
		});
	}

	@Post('register')
	@ApiOperation({ summary: 'Register a new user' })
	@ApiBody(getReference('RegisterSchema'))
	async register(
		@Body(new ZodValidationPipe(RegisterSchema)) data: RegisterData,
		@Ip() ip: string,
	): Promise<RegisterResponse> {
		return this.authService.register(data, ip);
	}

	@Post('verify-email')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Verify user email with OTP' })
	@ApiBody(getReference('VerifyEmailSchema'))
	async verifyEmail(
		@Body(new ZodValidationPipe(VerifyEmailSchema)) data: VerifyEmailData,
		@Ip() ip: string,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<AuthResponse> {
		const result = await this.authService.verifyEmail(data, ip);

		this.setAccessTokenCookie(res, result.accessToken);
		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			user: result.user,
		};
	}

	@Post('resend-code')
	@HttpCode(HttpStatus.OK)
	@ApiBody(getReference('ResendCodeSchema'))
	async resendCode(
		@Body(new ZodValidationPipe(ResendCodeSchema)) data: ResendCodeData,
	): Promise<void> {
		await this.authService.resendCode(data);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'User login' })
	@ApiBody(getReference('LoginSchema'))
	async login(
		@Body(new ZodValidationPipe(LoginSchema)) data: LoginData,
		@Ip() ip: string,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<AuthResponse> {
		const result = await this.authService.login(data, ip);

		this.setAccessTokenCookie(res, result.accessToken);
		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			user: result.user,
		};
	}

	@Post('google')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Login or register with Google OAuth' })
	@ApiBody(getReference('GoogleLoginSchema'))
	async googleLogin(
		@Body(new ZodValidationPipe(GoogleLoginSchema)) data: GoogleLoginData,
		@Ip() ip: string,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<AuthResponse> {
		const result = await this.authService.googleLogin(data, ip);

		this.setAccessTokenCookie(res, result.accessToken);
		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			user: result.user,
		};
	}

	@Post('refresh')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Refresh access token' })
	async refresh(
		@Req() req: express.Request,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<void> {
		const tokenFromCookie = req.cookies['refreshToken'];
		if (!tokenFromCookie) throw new AppException(AppErrorCode.REFRESH_TOKEN_MISSING);

		const result = await this.authService.refreshTokens(tokenFromCookie);

		this.setAccessTokenCookie(res, result.accessToken);
		this.setRefreshTokenCookie(res, result.refreshToken);
	}

	@Post('forgot-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Request password reset code' })
	@ApiBody(getReference('ForgotPasswordSchema'))
	async forgotPassword(
		@Body(new ZodValidationPipe(ForgotPasswordSchema)) data: ForgotPasswordData,
		@Ip() ip: string,
	): Promise<void> {
		await this.authService.forgotPassword(data, ip);
	}

	@Post('reset-password')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Reset password with OTP' })
	@ApiBody(getReference('ResetPasswordSchema'))
	async resetPassword(
		@Body(new ZodValidationPipe(ResetPasswordSchema)) data: ResetPasswordData,
		@Ip() ip: string,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<AuthResponse> {
		const result = await this.authService.resetPassword(data, ip);

		this.setAccessTokenCookie(res, result.accessToken);
		this.setRefreshTokenCookie(res, result.refreshToken);

		return {
			user: result.user,
		};
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Logout and revoke refresh token' })
	async logout(
		@Req() req: express.Request,
		@Res({ passthrough: true }) res: express.Response,
	): Promise<void> {
		const refreshToken = req.cookies['refreshToken'];

		if (refreshToken) {
			await this.authService.logout(refreshToken);
		}

		// Clear the cookie by setting its expiration to the past
		this.clearAccessTokenCookie(res);
		this.clearRefreshTokenCookie(res);
	}
}
