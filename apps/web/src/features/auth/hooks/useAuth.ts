import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import {
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
import { useRouter } from 'next/navigation';

export const useRegister = () => {
	const { openModal } = useModalStore();
	const { addToast } = useToastStore();

	return useMutation({
		mutationFn: (data: RegisterData) => authApi.register(data),
		onError: (error: unknown) => {
			const message = getApiErrorMessage(error, 'Registration failed');
			addToast(message, ToastType.ERROR);
		},
		onSettled: (_, __, variables) => {
			openModal(ModalType.VerifyEmail, { email: variables.email });
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
	const router = useRouter();

	return useMutation({
		mutationFn: (data: VerifyEmailData) => authApi.verifyEmail(data),
		onSuccess: ({ data }) => {
			router.push('/profile');
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
	const router = useRouter();

	return useMutation({
		mutationFn: (data: LoginData) => authApi.login(data),
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['me'], data.user);
			router.push('/profile');
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
	const router = useRouter();

	return useMutation({
		mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['me'], data.user);
			router.push('/profile');
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
	const router = useRouter();

	return useMutation({
		mutationFn: () => authApi.logout(),
		onSuccess: () => {
			router.push('/');
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
