'use client';

import { Modal } from '@/components/ui/Modal';
import { GoogleButton } from '@/components/ui/Buttons';
import { ModalDivider, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { ModalType, useModalStore } from '@/stores';
import { useModalData } from '@/stores/modalStore';
import VerifyEmailForm from './VerifyEmailForm';
import { authModalConfig } from './authModalConfig';
import ForgotPasswordForm from './ForgotPasswordForm';
import { useTranslation } from '@/hooks/translation';
import { Check } from 'lucide-react';
import { useBrand, useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';

const MARKET_PERKS = ['auth.marketPerk1', 'auth.marketPerk2', 'auth.marketPerk3'] as const;

/**
 * AuthModal wraps LoginForm or RegisterForm with the universal Modal component.
 * Handles header, close button, Google login, and footer switching.
 */
export default function AuthModal() {
	const { activeModal, openModal, closeModal } = useModalStore();
	const translate = useTranslation();
	const brand = useBrand();
	const skin = useSkin();
	const isMarket = skin === 'market';
	const isDrawer = skin === 'drawer';
	const isSwitchable = activeModal === ModalType.Login || activeModal === ModalType.Register;

	const forgotMode = useModalData(ModalType.ForgotPassword)?.mode ?? 'signIn';
	const baseConfig = authModalConfig[activeModal as ModalType];
	// Opened from the profile the window is about the password, and "remember your password? log
	// in" makes no sense to someone who is already signed in.
	const config =
		baseConfig && activeModal === ModalType.ForgotPassword && forgotMode === 'changePassword'
			? {
					...baseConfig,
					title: 'auth.changePasswordTitle' as const,
					subtitle: 'auth.changePasswordSubtitle' as const,
					footerQuestion: '' as const,
					footerAction: '' as const,
				}
			: baseConfig;

	return (
		<Modal
			onClose={closeModal}
			size={isMarket ? 'xl' : 'lg'}
			contentClassName={isMarket ? 'sm:max-w-3xl!' : ''}
			position="center"
			disableEscapeClose={false}
			disableBackdropClose={false}
			ariaLabel={config?.ariaLabel ? translate(config.ariaLabel) : translate('auth.authModal')}
		>
			{config && (
				<div className={cn(isMarket && 'md:grid md:grid-cols-[5fr_7fr]')}>
				{isMarket && (
					<aside className="bg-primary/10 hidden flex-col justify-between gap-10 p-8 md:flex dark:bg-neutral-800">
						<span className="text-primary text-3xl font-black tracking-tight dark:text-white">{brand.name}</span>
						<ul className="space-y-4">
							{MARKET_PERKS.map((key) => (
								<li key={key} className="flex items-start gap-3 text-[15px] font-medium text-gray-800 dark:text-gray-100">
									<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
										<Check className="size-4" strokeWidth={3} />
									</span>
									{translate(key)}
								</li>
							))}
						</ul>
					</aside>
				)}
				<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8 lg:p-10 dark:bg-gray-900 dark:shadow-black/50 in-data-[skin=minimal]:shadow-none in-data-[skin=listing]:shadow-none in-data-[skin=market]:shadow-none in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:shadow-none in-data-[skin=drawer]:dark:bg-neutral-900 in-data-[skin=market]:sm:rounded-2xl in-data-[skin=market]:md:p-8 in-data-[skin=minimal]:sm:rounded-2xl in-data-[skin=listing]:sm:rounded-lg in-data-[skin=minimal]:dark:bg-neutral-900 in-data-[skin=listing]:dark:bg-neutral-900">
					{isDrawer && (
						<div className="mb-5 flex flex-col items-center gap-4 sm:mb-6">
							<span className="text-primary text-3xl font-black tracking-tight">{brand.name}</span>
							{isSwitchable && (
								<div
									role="tablist"
									className="grid w-full grid-cols-2 rounded-full bg-gray-100 p-1 dark:bg-neutral-800"
								>
									{([ModalType.Login, ModalType.Register] as const).map((type) => (
										<button
											key={type}
											type="button"
											role="tab"
											aria-selected={activeModal === type}
											onClick={() => activeModal !== type && openModal(type)}
											className={cn(
												'h-10 cursor-pointer rounded-full text-sm font-bold transition-colors',
												activeModal === type
													? 'bg-white text-gray-900 shadow-sm dark:bg-neutral-950 dark:text-white'
													: 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
											)}
										>
											{translate(type === ModalType.Login ? 'header.logIn' : 'header.signUp')}
										</button>
									))}
								</div>
							)}
						</div>
					)}

					{/* Header */}
					<ModalHeader
							title={translate(config.title, { brand: brand.name })}
							subtitle={translate(config.subtitle)}
							onClose={closeModal}
						/>

					{/* Form */}
					{activeModal === ModalType.Login && <LoginForm />}
					{activeModal === ModalType.Register && <RegisterForm />}
					{activeModal === ModalType.VerifyEmail && <VerifyEmailForm />}
					{activeModal === ModalType.ForgotPassword && <ForgotPasswordForm />}

					{config.showGoogle && (
						<>
							<ModalDivider />
							<GoogleButton />
						</>
					)}

					{config.footerQuestion && !(isDrawer && isSwitchable) && (
						<ModalFooter
							question={translate(config.footerQuestion)}
							actionLabel={config.footerAction ? translate(config.footerAction) : ''}
							onActionClick={() => {
								if (activeModal === ModalType.Login) openModal(ModalType.Register);
								else if (activeModal === ModalType.Register) openModal(ModalType.Login);
								else if (activeModal === ModalType.ForgotPassword) openModal(ModalType.Login);
							}}
						/>
					)}
				</div>
				</div>
			)}
		</Modal>
	);
}
