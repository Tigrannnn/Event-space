'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseCooldownReturn } from '../types/cooldown.types';
import { AUTH_CONFIG, AuthAction, AuthKeyType, Email } from '@event-space/shared';

interface UseCooldownOptions {
	email: Email;
	action: AuthAction;
}

export function useCooldown({ email, action }: UseCooldownOptions): UseCooldownReturn {
	const storageKey = `${AUTH_CONFIG.KEY_PREFIX}:${AuthKeyType.COOLDOWN}:${action}:${email}`;
	const durationSeconds = AUTH_CONFIG.RATE_LIMITS.OTP_RESEND_COOLDOWN_SEC;

	const calculateRemaining = useCallback(() => {
		if (typeof window === 'undefined') return 0;

		const endTime = localStorage.getItem(storageKey);
		if (!endTime) return 0;

		const remaining = Math.ceil((parseInt(endTime, 10) - Date.now()) / 1000);
		return Math.max(0, remaining);
	}, [storageKey]);

	const [remainingSeconds, setRemainingSeconds] = useState(() => calculateRemaining());

	const startCooldown = useCallback(
		(overrideEmail?: string) => {
			if (typeof window === 'undefined') return;

			const targetEmail = overrideEmail || email;
			if (!targetEmail) return;

			const key = `${AUTH_CONFIG.KEY_PREFIX}:${AuthKeyType.COOLDOWN}:${action}:${targetEmail}`;
			const endTime = Date.now() + durationSeconds * 1000;
			localStorage.setItem(key, endTime.toString());
			setRemainingSeconds(durationSeconds);
		},
		[durationSeconds, email, action],
	);

	const resetCooldown = useCallback(() => {
		if (typeof window === 'undefined') return;

		localStorage.removeItem(storageKey);
		setRemainingSeconds(0);
	}, [storageKey]);

	// Countdown timer

	useEffect(() => {
		if (remainingSeconds <= 0) return;

		const interval = setInterval(() => {
			const remaining = calculateRemaining();
			if (remaining <= 0) {
				setRemainingSeconds(0);
				localStorage.removeItem(storageKey);
				clearInterval(interval);
			} else {
				setRemainingSeconds(remaining);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [remainingSeconds, calculateRemaining, storageKey]);

	return {
		isOnCooldown: remainingSeconds > 0,
		remainingSeconds,
		startCooldown,
		resetCooldown,
	};
}
