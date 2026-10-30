'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useCurrentUser } from '@/features/users';

export type AuthHint = 'user' | 'guest' | 'unknown';

const STORAGE_KEY = 'auth-hint';

const subscribe = (notify: () => void) => {
	window.addEventListener('storage', notify);
	return () => window.removeEventListener('storage', notify);
};

const readHint = (): AuthHint => {
	try {
		const value = window.localStorage.getItem(STORAGE_KEY);
		return value === 'user' || value === 'guest' ? value : 'unknown';
	} catch {
		return 'unknown';
	}
};

/**
 * Who was here last time, so the placeholders drawn while the answer is on its way can match
 * what is about to appear: three buttons for someone signed in, two for a guest. It is only a
 * guess for the skeleton and never decides what is shown.
 */
export function useAuthHint(): AuthHint {
	const { data: user, isLoading } = useCurrentUser();
	const hint = useSyncExternalStore(subscribe, readHint, () => 'unknown' as AuthHint);

	useEffect(() => {
		if (isLoading) return;

		try {
			window.localStorage.setItem(STORAGE_KEY, user ? 'user' : 'guest');
		} catch {
			// Storage can be blocked; the skeleton then falls back to its default.
		}
	}, [isLoading, user]);

	return hint;
}
