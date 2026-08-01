import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import {
	AuthAction,
	ForgotPasswordData,
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
import { useApiError } from '@/hooks/apiError';
import { useTranslation } from '@/hooks/translation';

export const useRegister = () => {
	const { openModal } = useModalStore();
	const { addToast } = useToastStore();
	const apiError = useApiError();
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
			const message = apiError(error, 'auth.registerFailed');
			openModal(ModalType.VerifyEmail, { email: variables.email });
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useResendCode = () => {
	const { addToast } = useToastStore();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: ResendCodeData) => authApi.resendCode(data),
		onSuccess: () => {
			addToast(translate('auth.codeSentSuccess'), ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'auth.resendCodeFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useVerifyEmail = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: VerifyEmailData) => authApi.verifyEmail(data),
		onSuccess: ({ data }) => {
			navigation.push('/profile');
			queryClient.setQueryData(['me'], data.user);
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			queryClient.invalidateQueries({ queryKey: ['favorites'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
			queryClient.invalidateQueries({ queryKey: ['event'] });
			addToast(translate('auth.verifySuccess'), ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'auth.verifyFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useLogin = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: LoginData) => authApi.login(data),
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['me'], data.user);
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			queryClient.invalidateQueries({ queryKey: ['favorites'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
			queryClient.invalidateQueries({ queryKey: ['event'] });
			navigation.push('/profile');
			addToast(translate('auth.loginSuccess'), ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'auth.loginFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useForgotPassword = () => {
	const { addToast } = useToastStore();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: ForgotPasswordData) => authApi.forgotPassword(data),
		onSuccess: () => {
			addToast(translate('auth.resetCodeSentSuccess'), ToastType.SUCCESS);
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'auth.sendResetCodeFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useResetPassword = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: (data: ResetPasswordData) => authApi.resetPassword(data),
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['me'], data.user);
			queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
			queryClient.invalidateQueries({ queryKey: ['favorites'] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
			queryClient.invalidateQueries({ queryKey: ['event'] });
			navigation.push('/profile');
			addToast(translate('auth.resetPasswordSuccess'), ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'auth.resetPasswordFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};

export const useLogout = () => {
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();
	const apiError = useApiError();
	const translate = useTranslation();

	return useMutation({
		mutationFn: () => authApi.logout(),
		onSuccess: async () => {
			navigation.push('/');
			queryClient.setQueryData(['me'], null);
			await Promise.all([
				queryClient.removeQueries({ queryKey: ['my-bookings'] }),
				queryClient.removeQueries({ queryKey: ['events'] }),
				queryClient.removeQueries({ queryKey: ['event'] }),
				queryClient.removeQueries({ queryKey: ['admin'] }),
				queryClient.removeQueries({ queryKey: ['categories'] }),
			]);
			addToast(translate('auth.logoutSuccess'), ToastType.SUCCESS);
			closeModal();
		},
		onError: (error: unknown) => {
			const message = apiError(error, 'auth.logoutFailed');
			addToast(message, ToastType.ERROR);
		},
	});
};
