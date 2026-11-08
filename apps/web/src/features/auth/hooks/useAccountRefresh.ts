import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import type { SafeUserData } from '@event-space/shared';

/**
 * Everything on screen that depends on who is signed in, redone at once: the profile goes
 * into the cache, every other query is marked stale and refetched, and the server-rendered
 * parts of the page are rendered again with the new session cookie.
 */
export function useAccountRefresh() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useCallback(
		(user: SafeUserData | null) => {
			queryClient.setQueryData(['me'], user);
			void queryClient.invalidateQueries({ refetchType: 'all' });
			router.refresh();
		},
		[queryClient, router],
	);
}
