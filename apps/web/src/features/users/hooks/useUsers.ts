import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeUserData, UpdateUserData, getApiErrorMessage } from '@event-space/shared';
import { useToastStore } from '@/stores/toastStore';
import { ToastType } from '@/stores/toastStore/types';
import { usersApi } from '../api/users.api';

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

	return useMutation({
		mutationFn: (data: UpdateUserData) => usersApi.updateMe(data),
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(['me'], updatedUser);
			addToast('Profile updated successfully', ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Failed to update profile');
			addToast(message, ToastType.ERROR);
		},
	});
}

export function useDeleteCurrentUser() {
	const queryClient = useQueryClient();
	const { addToast } = useToastStore();

	return useMutation({
		mutationFn: () => usersApi.deleteMe(),
		onSuccess: () => {
			queryClient.setQueryData(['me'], null);
			queryClient.clear();
			addToast('Account deleted successfully', ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Failed to delete account');
			addToast(message, ToastType.ERROR);
		},
	});
}
