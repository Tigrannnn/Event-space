import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import {
	AuthAction,
	ForgotPasswordData,
	getApiErrorMessage,
	LoginData,
	RegisterData,
	ResendCodeData,
	ResetPasswordData,
	VerifyEmailData,
} from '@event-space/shared';
import { useToastStore } from '@/stores/toastStore';
import { ToastType } from '@/stores/toastStore/types';
import { ModalType, useModalStore } from '@/stores';
import { useCooldown } from './useCooldown';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export const useRegister = () => {
	const { openModal } = useModalStore();
	const { addToast } = useToastStore();
	const { startCooldown } = useCooldown({
		email: '',
		action: AuthAction.REGISTER,
	});

	return useMutation({
		mutationFn: (data: RegisterData) => authApi.register(data),
		onSuccess: (_, variables) => {
			openModal(ModalType.VerifyEmail, { email: variables.email });
			startCooldown(variables.email);
		},
		onError: (error: unknown, variables: RegisterData) => {
			const message = getApiErrorMessage(error, 'Registration failed');
			if (message.includes('wait before')) {
				openModal(ModalType.VerifyEmail, { email: variables.email });
			}
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useResendCode = () => {
	const { addToast } = useToastStore();

	return useMutation({
		mutationFn: (data: ResendCodeData) => authApi.resendCode(data),
		onSuccess: ({ data }) => {
			addToast(data.message, ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Failed to resend code');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useVerifyEmail = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();

	return useMutation({
		mutationFn: (data: VerifyEmailData) => authApi.verifyEmail(data),
		onSuccess: ({ data }) => {
			navigation.push('/profile');
			queryClient.setQueryData(['me'], data.user);
			addToast(data.message, ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Verification failed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useLogin = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();

	return useMutation({
		mutationFn: (data: LoginData) => authApi.login(data),
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['me'], data.user);
			navigation.push('/profile');
			addToast(data.message, ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Login failed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useForgotPassword = () => {
	const { addToast } = useToastStore();

	return useMutation({
		mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
		onSuccess: ({ data }) => {
			addToast(data.message, ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Failed to send reset code');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useResetPassword = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();

	return useMutation({
		mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['me'], data.user);
			navigation.push('/profile');
			addToast('Password reset successfully.', ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Failed to reset password');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useLogout = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();

	return useMutation({
		mutationFn: () => authApi.logout(),
		onSuccess: () => {
			navigation.push('/');
			queryClient.setQueryData(['me'], null);
			queryClient.invalidateQueries({ queryKey: ['bookings'] });
			addToast('Logged out successfully.', ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Logout failed');
			addToast(message, ToastType.ERROR);
		},
	});
};
