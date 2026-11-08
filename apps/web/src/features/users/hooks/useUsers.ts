import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeUserData, UpdateUserData } from '@event-space/shared';
import { useToastStore } from '@/stores/toastStore';
import { ToastType } from '@/stores/toastStore/types';
import { usersApi } from '../api/users.api';
import { useApiError } from '@/hooks/apiError';
import { useAuthHint } from '@/hooks/authHint/useAuthHint';
import { useTranslation } from '@/hooks/translation';

interface UseCurrentUserOptions {
	initialData?: SafeUserData;
	enabled?: boolean;
}

/**
 * Whether there is a session worth asking the server about. The server saw the session cookie
 * on this page's request (the hint), so a visitor without one never fires /users/me or the
 * queries behind it. Once the cache holds an answer it wins: a login fills it, a logout
 * empties it, and neither needs a reload.
 */
export function useIsSignedIn(): boolean {
	const hint = useAuthHint();
	const { data } = useQuery<SafeUserData | null>({
		queryKey: ['me'],
		queryFn: () => usersApi.getMe(),
		enabled: false,
	});

	return data === undefined ? hint === 'user' : data !== null;
}

export function useCurrentUser(options?: UseCurrentUserOptions) {
	const isSignedIn = useIsSignedIn();

	return useQuery({
		queryKey: ['me'],
		queryFn: () => usersApi.getMe(),
		retry: false,
		staleTime: 5 * 60 * 1000,
		initialData: options?.initialData,
		enabled: isSignedIn && (options?.enabled ?? true),
	});
}

export function useUpdateCurrentUser() {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: UpdateUserData) => usersApi.updateMe(data),
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(['me'], updatedUser);
			addToast(translate('profile.updateSuccess'), ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'profile.updateFailed');
			addToast(message, ToastType.ERROR);
		},
	});
}
