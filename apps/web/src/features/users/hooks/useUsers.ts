import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeUserData, UpdateUserData } from '@event-space/shared';
import { useToastStore } from '@/stores/toastStore';
import { ToastType } from '@/stores/toastStore/types';
import { usersApi } from '../api/users.api';
import { useApiError } from '@/hooks/apiError';
import { useTranslation } from '@/hooks/translation';

interface UseCurrentUserOptions {
	initialData?: SafeUserData;
	enabled?: boolean;
}

export function useCurrentUser(options?: UseCurrentUserOptions) {
	return useQuery({
		queryKey: ['me'],
		queryFn: () => usersApi.getMe(),
		retry: false,
		staleTime: 5 * 60 * 1000,
		initialData: options?.initialData,
		enabled: options?.enabled,
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
