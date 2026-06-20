'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGoogleLogin } from '@react-oauth/google';
import { LoaderCircle } from 'lucide-react';
import { authApi } from '@/features/auth';
import { ToastType, useToastStore } from '@/stores/toastStore';
import { useModalStore } from '@/stores';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';

export default function GoogleButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();
	const navigation = useLocalizedNavigation();
	const translate = useTranslation();
	const { addToast } = useToastStore();
	const { closeModal } = useModalStore();

	const login = useGoogleLogin({
		flow: 'auth-code',
		onSuccess: async (credentialResponse) => {
			setIsLoading(true);
			try {
				await authApi.googleLogin({ token: credentialResponse.code });
				await queryClient.invalidateQueries({ queryKey: ['me'] });
				navigation.push('/profile');
				closeModal();
			} catch (error: unknown) {
				const message =
					(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
					'Google login failed';
				addToast(message, ToastType.ERROR);
			} finally {
				setIsLoading(false);
			}
		},
		onError: () => console.error('Google login popup closed or failed'),
	});

	return (
		<button
			type="button"
			onClick={() => login()}
			disabled={isLoading}
			className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white py-4 font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
			{...props}
		>
			{isLoading ? (
				<LoaderCircle className="h-5 w-5 animate-spin" />
			) : (
				<>
					<svg className="h-5 w-5" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M23.766 12.2764c0-.8942-.0793-1.7553-.2233-2.5886H12.2421v4.904h6.5454c-.2822 1.5153-1.1388 2.7982-2.4221 3.6593v3.0493h3.9202c2.2943-2.1128 3.6206-5.2282 3.6206-8.914z"
						/>
						<path
							fill="#34A853"
							d="M12.2421 24.0051c3.2863 0 6.0398-1.0898 8.0475-2.9376l-3.9202-3.0493c-1.0898.733-2.4813 1.1685-4.1273 1.1685-3.1677 0-5.8513-2.1373-6.8118-5.0123H2.2329v3.1539C4.2306 21.3055 7.9849 24.0051 12.2421 24.0051z"
						/>
						<path
							fill="#FBBC05"
							d="M5.43054 14.1744c-.24488-.733-.38264-1.5153-.38264-2.3221s.13776-1.5891.38264-2.3221V6.37632H2.2329C1.42651 7.98492 1 9.83264 1 11.8523s.42651 3.8674 1.2329 5.476l3.19764-3.1539z"
						/>
						<path
							fill="#EA4335"
							d="M12.2421 4.79322c1.785 0 3.3863.6144 4.6454 1.824l3.4776-3.4776C18.2558 1.20214 15.5023 0 12.2421 0 7.9849 0 4.23054 2.69959 2.2329 5.89696l3.19764 3.1539c.9605-2.875 3.6441-5.0123 6.81156-5.0123z"
						/>
					</svg>
					{translate('auth.continueWithGoogle')}
				</>
			)}
		</button>
	);
}
