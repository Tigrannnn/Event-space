import {
	Injectable,
	ConflictException,
	Logger,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
	AUTH_CONFIG,
	EnvKey,
	AuthAction,
	ForgotPasswordData,
	GoogleLoginData,
	LoginData,
	RegisterData,
	RegisterResponse,
	ResendCodeData,
	ResetPasswordData,
	SafeUserData,
	VerifyEmailData,
	AuthKeyType,
	Email,
} from '@event-space/shared';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { AuthServiceResponse, JwtPayload, TokenServiceResponse } from './types';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '@infra/prisma/prisma.service';
import { RedisService } from '@infra/redis/redis.service';
import { RateLimiterService } from '@infra/rate-limiter/rate-limiter.service';
import { MailService } from '@infra/mail/mail.service';
import { UserRoleType } from '@event-space/shared';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);
	private readonly googleClient: OAuth2Client;

	constructor(
		private readonly prisma: PrismaService,
		private readonly redis: RedisService,
		private readonly jwt: JwtService,
		private readonly config: ConfigService,
		private readonly rateLimiter: RateLimiterService,
		private readonly mail: MailService,
	) {
		this.googleClient = new OAuth2Client(
			this.config.get(EnvKey.GOOGLE_CLIENT_ID),
			this.config.get(EnvKey.GOOGLE_CLIENT_SECRET),
			'postmessage',
		);
	}

	private getOtpKey(action: AuthAction, email: Email): string {
		return `${AUTH_CONFIG.KEY_PREFIX}:${AuthKeyType.OTP}:${action}:${email}`;
	}

	private async getTokens(userId: string, email: Email | null, role: string) {
		const payload: JwtPayload = { sub: userId, email, role };

		const accessToken = await this.jwt.signAsync(payload, {
			secret: this.config.get(EnvKey.JWT_ACCESS_SECRET),
			expiresIn: AUTH_CONFIG.ACCESS.ACCESS_TOKEN_EXPIRY,
		});

		const refreshTokenValidator = crypto
			.randomBytes(AUTH_CONFIG.STRATEGY.REFRESH_TOKEN_BYTES)
			.toString('hex');

		return { accessToken, refreshTokenValidator };
	}

	private async generateAndSaveTokens(
		userId: string,
		email: Email | null,
		role: UserRoleType,
		db: Prisma.TransactionClient | PrismaService = this.prisma,
	): Promise<TokenServiceResponse> {
		const { accessToken, refreshTokenValidator } = await this.getTokens(userId, email, role);

		const hashedValidator = await bcrypt.hash(
			refreshTokenValidator,
			AUTH_CONFIG.STRATEGY.BCRYPT_SALT_ROUNDS,
		);

		const tokenRecord = await db.refreshToken.create({
			data: {
				hashedToken: hashedValidator,
				userId,
				expiresAt: new Date(Date.now() + AUTH_CONFIG.REFRESH.REFRESH_TOKEN_EXPIRY_MS),
			},
		});

		const refreshToken = `${tokenRecord.id}.${refreshTokenValidator}`;

		return {
			accessToken: accessToken,
			refreshToken: refreshToken,
		};
	}

	private async generateAndSaveOtp(action: AuthAction, email: Email): Promise<string> {
		const digits = AUTH_CONFIG.OTP.DIGITS;
		const min = Math.pow(10, digits - 1);
		const max = Math.pow(10, digits);

		const otp = crypto.randomInt(min, max).toString();

		const otpKey = this.getOtpKey(action, email);
		await this.redis.set(otpKey, otp, AUTH_CONFIG.OTP.EXPIRY_SECONDS);

		await this.rateLimiter.setCooldown(action, email);

		await this.mail.sendVerificationCode(email, otp, action);

		return otp;
	}

	async register(data: RegisterData, ip: string): Promise<RegisterResponse> {
		const { email, password, name } = data;
		const action = AuthAction.REGISTER;

		await this.rateLimiter.validate(action, email, ip, { checkCooldown: true });

		const existingUser = await this.prisma.user.findUnique({ where: { email } });

		if (existingUser && existingUser.emailVerified) {
			throw new ConflictException('User with this email already exists');
		}

		const hashedPassword = await bcrypt.hash(password, AUTH_CONFIG.STRATEGY.BCRYPT_SALT_ROUNDS);
		let userId: string;

		if (existingUser && !existingUser.emailVerified) {
			const updatedUser = await this.prisma.user.update({
				where: { email },
				data: { name, passwordHash: hashedPassword },
			});
			userId = updatedUser.id;
		} else {
			const newUser = await this.prisma.user.create({
				data: { email, name, passwordHash: hashedPassword },
			});
			userId = newUser.id;
		}

		await this.generateAndSaveOtp(action, email);

		return {
			message: 'Registration successful. Please check your email for the verification code.',
			userId,
		};
	}

	async verifyEmail(data: VerifyEmailData, ip: string): Promise<AuthServiceResponse> {
		const { email, code } = data;
		const action = AuthAction.REGISTER;

		await this.rateLimiter.validate(action, email, ip, { checkCooldown: false });

		const otpKey = this.getOtpKey(action, email);
		const savedOtp = await this.redis.get(otpKey);

		if (!savedOtp || savedOtp !== code) {
			await this.rateLimiter.hit(action, email, ip);

			throw new BadRequestException('Invalid or expired verification code');
		}

		// Transaction ensures atomicity: user verification + token generation
		return await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.update({
				where: { email },
				data: { emailVerified: true },
			});

			const tokens = await this.generateAndSaveTokens(user.id, user.email, user.role, tx);

			const otpKey = this.getOtpKey(action, email);
			await this.redis.del(otpKey);

			await this.rateLimiter.clean(action, email, ip);

			const { passwordHash, ...safeUser } = user;

			return {
				message: 'Email verified successfully',
				...tokens,
				user: safeUser,
			};
		});
	}

	async resendCode(data: ResendCodeData): Promise<void> {
		const { action, email } = data;

		await this.rateLimiter.validate(action, email, undefined, { checkCooldown: true });

		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) return;

		await this.generateAndSaveOtp(action, email);
	}

	async login(data: LoginData, ip: string): Promise<AuthServiceResponse> {
		const { email, password } = data;
		const action = AuthAction.LOGIN;

		await this.rateLimiter.validate(action, email, ip, { checkCooldown: false });

		const user = await this.prisma.user.findUnique({ where: { email } });

		/**
		 * Constant-time verification to prevent timing attacks.
		 * We use a dummy hash if the user doesn't exist so bcrypt.compare always runs.
		 */
		const dummyHash = crypto
			.createHash('sha256')
			.update(email + 'salt')
			.digest('hex');
		const compareHash = user?.passwordHash || dummyHash;
		const isPasswordValid = await bcrypt.compare(password, compareHash);

		if (!user) {
			throw new UnauthorizedException('Invalid email or password');
		}

		if (!user.passwordHash) {
			throw new BadRequestException(
				'This account uses social login. Please log in with the associated provider (Google)',
			);
		}

		if (!isPasswordValid) {
			await this.rateLimiter.hit(action, email, ip);

			throw new UnauthorizedException('Invalid email or password');
		}

		if (!user.emailVerified) {
			throw new ForbiddenException('Please verify your email first');
		}

		const tokens = await this.generateAndSaveTokens(user.id, user.email, user.role);

		const { passwordHash, ...safeUser } = user;

		return {
			message: 'Login successful',
			...tokens,
			user: safeUser,
		};
	}

	async googleLogin(data: GoogleLoginData, ip: string): Promise<AuthServiceResponse> {
		const { token } = data;

		try {
			const { tokens } = await this.googleClient.getToken({
				code: token,
			});

			const ticket = await this.googleClient.verifyIdToken({
				idToken: tokens.id_token!,
				audience: this.config.get(EnvKey.GOOGLE_CLIENT_ID),
			});

			const payload = ticket.getPayload();
			if (!payload) throw new UnauthorizedException('Invalid Google payload');

			const { sub: googleId, email, name, picture: image, email_verified } = payload;

			if (!email) throw new UnauthorizedException('Email not provided by Google');

			if (!email_verified) {
				throw new UnauthorizedException('Google email is not verified');
			}

			// Rate limiting: check local (IP) and global (email) attempt limits
			await this.rateLimiter.validate(AuthAction.LOGIN, email, ip, { checkCooldown: false });

			return await this.prisma.$transaction(async (tx) => {
				let user = await tx.user.findUnique({ where: { googleId } });

				if (!user) {
					user = await tx.user.findUnique({ where: { email } });
					if (user) {
						user = await tx.user.update({
							where: { id: user.id },
							data: { googleId, emailVerified: true, image: user.image || image },
						});
					} else {
						user = await tx.user.create({
							data: { email, name: name || 'Google User', googleId, image, emailVerified: true },
						});
					}
				}

				const tokens = await this.generateAndSaveTokens(user.id, user.email, user.role, tx);

				// Set cooldown to prevent Google login spam
				await this.rateLimiter.setCooldown(AuthAction.LOGIN, email);

				const { passwordHash, ...safeUser } = user;

				return { message: 'Google login successful', ...tokens, user: safeUser };
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			throw new UnauthorizedException(`Google authentication failed: ${message}`);
		}
	}

	async refreshTokens(refreshToken: string): Promise<TokenServiceResponse> {
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token missing');
		}

		const [id, validator] = refreshToken.split('.');

		if (!id || !validator) {
			throw new UnauthorizedException('Invalid token format');
		}

		const tokenRecord = await this.prisma.refreshToken.findUnique({
			where: { id },
			include: { user: true },
		});

		if (!tokenRecord) {
			throw new ForbiddenException('Access Denied');
		}

		// Bcrypt comparison protects against DB leaks:
		// even if the token table is exposed, the raw validator is never stored
		const isValidatorValid = await bcrypt.compare(validator, tokenRecord.hashedToken);
		if (!isValidatorValid) {
			throw new ForbiddenException('Access Denied');
		}

		return this.prisma.$transaction(async (tx) => {
			if (new Date() > tokenRecord.expiresAt) {
				throw new ForbiddenException('Refresh token expired');
			}

			const deleted = await tx.refreshToken.deleteMany({
				where: { id: tokenRecord.id },
			});

			if (deleted.count === 0) {
				throw new ForbiddenException('Refresh token already used');
			}

			return this.generateAndSaveTokens(
				tokenRecord.user.id,
				tokenRecord.user.email,
				tokenRecord.user.role,
				tx,
			);
		});
	}

	async forgotPassword(data: ForgotPasswordData, ip: string): Promise<void> {
		const { email } = data;
		const action = AuthAction.RESET_PASSWORD;

		await this.rateLimiter.validate(action, email, ip, { checkCooldown: true });

		const user = await this.prisma.user.findUnique({ where: { email } });

		if (!user) {
			// Same delay as OTP generation path — prevents timing-based enumeration
			await this.rateLimiter.setCooldown(action, email);

			return;
		}

		await this.generateAndSaveOtp(action, email);

		return;
	}

	async resetPassword(data: ResetPasswordData, ip: string): Promise<AuthServiceResponse> {
		const { email, code, newPassword } = data;
		const action = AuthAction.RESET_PASSWORD;

		await this.rateLimiter.validate(action, email, ip, { checkCooldown: false });

		const otpKey = this.getOtpKey(action, email);
		const savedOtp = await this.redis.get(otpKey);

		if (!savedOtp || savedOtp !== code) {
			await this.rateLimiter.hit(action, email, ip);

			throw new BadRequestException('Invalid or expired code');
		}

		const hashedPassword = await bcrypt.hash(newPassword, AUTH_CONFIG.STRATEGY.BCRYPT_SALT_ROUNDS);

		return this.prisma.$transaction(async (tx) => {
			const user = await tx.user.update({
				where: { email },
				data: { passwordHash: hashedPassword },
			});

			await this.redis.del(this.getOtpKey(action, email));

			await this.rateLimiter.clean(action, email, ip);

			await tx.refreshToken.deleteMany({ where: { userId: user.id } });

			const tokens = await this.generateAndSaveTokens(user.id, user.email, user.role, tx);

			const { passwordHash, ...safeUser } = user;

			return {
				message: 'Password reset successfully',
				accessToken: tokens.accessToken,
				refreshToken: tokens.refreshToken,
				user: safeUser,
			};
		});
	}

	async logout(refreshToken: string): Promise<void> {
		const [id, validator] = refreshToken.split('.');

		if (!id || !validator) {
			return;
		}

		const tokenRecord = await this.prisma.refreshToken.findUnique({
			where: { id },
		});

		if (!tokenRecord) {
			return;
		}

		const isValidatorValid = await bcrypt.compare(validator, tokenRecord.hashedToken);

		if (!isValidatorValid) {
			return;
		}

		await this.prisma.refreshToken.delete({
			where: { id: tokenRecord.id },
		});
	}
}
