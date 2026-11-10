import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { SafeUserData } from '@event-space/shared';

const ACCOUNT_QUERY_KEYS = [['my-bookings'], ['favorites'], ['booking-view'], ['admin'], ['search', 'history']];

/**
 * Everything that belongs to the signed-in person, redone at once: the profile goes into the
 * cache and their bookings, favourites and admin data are refetched. Tours are public and
 * look the same to everyone, so they are left alone.
 */
export function useAccountRefresh() {
	const queryClient = useQueryClient();

	return useCallback(
		(user: SafeUserData | null) => {
			queryClient.setQueryData(['me'], user);
			for (const queryKey of ACCOUNT_QUERY_KEYS) {
				void queryClient.invalidateQueries({ queryKey, refetchType: 'all' });
			}
		},
		[queryClient],
	);
}
