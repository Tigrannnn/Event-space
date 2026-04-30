import { Injectable, ForbiddenException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { AUTH_CONFIG, AuthAction, AuthKeyType, Email } from '@event-space/shared';

@Injectable()
export class RateLimiterService {
	constructor(private readonly redis: RedisService) {}

	private readonly otp_resend_cooldown_sec = AUTH_CONFIG.RATE_LIMITS.OTP_RESEND_COOLDOWN_SEC;
	private readonly otp_local_max_attempts = AUTH_CONFIG.RATE_LIMITS.OTP_LOCAL_MAX_ATTEMPTS;
	private readonly otp_global_max_attempts = AUTH_CONFIG.RATE_LIMITS.OTP_GLOBAL_MAX_ATTEMPTS;
	private readonly otp_local_lockout_sec = AUTH_CONFIG.RATE_LIMITS.OTP_LOCAL_LOCKOUT_SEC;
	private readonly otp_global_lockout_sec = AUTH_CONFIG.RATE_LIMITS.OTP_GLOBAL_LOCKOUT_SEC;

	/**
	 * Generates Redis keys for tracking local attempts, global attempts, and resend cooldowns.
	 */
	public getLimitKeys(
		action: AuthAction,
		email: Email,
		ip?: string,
	): { localKey: string | null; globalKey: string; cooldownKey: string } {
		const attemptsBase = `${AUTH_CONFIG.KEY_PREFIX}:limit:${AuthKeyType.ATTEMPTS}:${action}:${email}`;
		const cooldownBase = `${AUTH_CONFIG.KEY_PREFIX}:limit:${AuthKeyType.COOLDOWN}:${action}:${email}`;
		return {
			localKey: ip ? `${attemptsBase}:${ip}` : null, // Limit per Email + IP pair
			globalKey: `${attemptsBase}:global`, // Limit per Email (distributed across all IPs)
			cooldownKey: `${cooldownBase}`, // Cooldown for OTP/Email resends
		};
	}

	/**
	 * Validates if the current request is within acceptable limits.
	 * Should be called at the beginning of the authentication flow.
	 * @param options.checkCooldown - Whether to check the resend cooldown (default: true).
	 *   Set to false when validating OTP verification attempts to avoid blocking
	 *   users who are trying to verify a code they just received.
	 */
	async validate(
		action: AuthAction,
		email: Email,
		ip?: string,
		options: { checkCooldown?: boolean } = { checkCooldown: true },
	): Promise<void> {
		const checkCooldown = options.checkCooldown ?? true;
		const { localKey, globalKey, cooldownKey } = this.getLimitKeys(action, email, ip);

		const checks = [
			localKey ? this.redis.get(localKey) : Promise.resolve(null),
			this.redis.get(globalKey),
		];

		if (checkCooldown) {
			checks.push(this.redis.get(cooldownKey));
		}

		const results = await Promise.all(checks);
		const localCount = results[0] as string | null;
		const globalCount = results[1] as string | null;
		const isCoolingDown = checkCooldown ? (results[2] as string | null) : null;

		// 1. Check Resend Cooldown (only if enabled)
		if (checkCooldown && isCoolingDown) {
			throw new ForbiddenException('Please wait before requesting a new code');
		}

		// 2. Check Local Limit (Protection against brute-force from a single device)
		if (localCount && Number(localCount) >= this.otp_local_max_attempts) {
			throw new ForbiddenException(
				'Too many attempts from this device, access blocked. Try again later.',
			);
		}

		// 3. Check Global Limit (Botnet protection across multiple IPs)
		if (globalCount && Number(globalCount) >= this.otp_global_max_attempts) {
			throw new ForbiddenException('This account is under global protection. Try again later.');
		}
	}

	/**
	 * Atomically increments the value for a specific key.
	 * Sets expiry only on first creation to ensure a fixed lockout period
	 * from the first failed attempt (prevents sliding expiration).
	 */
	private async increment(key: string, ttl: number): Promise<void> {
		const current = await this.redis.incr(key);
		if (current === 1) {
			await this.redis.expire(key, ttl);
		}
	}

	/**
	 * Increments the attempt counters. Call this when a login/OTP attempt fails.
	 */
	async hit(action: AuthAction, email: Email, ip: string): Promise<void> {
		const { localKey, globalKey } = this.getLimitKeys(action, email, ip);

		await Promise.all([
			localKey ? this.increment(localKey, this.otp_local_lockout_sec) : Promise.resolve(null),
			this.increment(globalKey, this.otp_global_lockout_sec),
		]);
	}

	/**
	 * Sets a temporary cooldown to prevent spamming OTP/Email generation.
	 */
	async setCooldown(action: AuthAction, email: Email): Promise<void> {
		const { cooldownKey } = this.getLimitKeys(action, email);
		await this.redis.set(cooldownKey, 'true', this.otp_resend_cooldown_sec);
	}

	/**
	 * Clears all limits for the specified action and user.
	 * Call this upon successful authentication.
	 */
	async clean(action: AuthAction, email: Email, ip: string): Promise<void> {
		const { localKey, globalKey, cooldownKey } = this.getLimitKeys(action, email, ip);
		await Promise.all([
			localKey ? this.redis.del(localKey) : Promise.resolve(null),
			this.redis.del(globalKey),
			this.redis.del(cooldownKey),
		]);
	}
}
