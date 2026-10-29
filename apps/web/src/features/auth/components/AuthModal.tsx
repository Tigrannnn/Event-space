'use client';

import { Modal } from '@/components/ui/Modal';
import { GoogleButton } from '@/components/ui/Buttons';
import { ModalDivider, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { ModalType, useModalStore } from '@/stores';
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
	const isMarket = useSkin() === 'market';

	const config = authModalConfig[activeModal as ModalType];

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
						<span className="text-primary text-3xl font-black tracking-tight">{brand.name}</span>
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
				<div className="w-full rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8 lg:p-10 dark:bg-gray-900 dark:shadow-black/50 in-data-[skin=minimal]:shadow-none in-data-[skin=listing]:shadow-none in-data-[skin=market]:shadow-none in-data-[skin=market]:sm:rounded-2xl in-data-[skin=market]:md:p-8 in-data-[skin=minimal]:sm:rounded-2xl in-data-[skin=listing]:sm:rounded-lg in-data-[skin=minimal]:dark:bg-neutral-900 in-data-[skin=listing]:dark:bg-neutral-900">
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

					{config.footerQuestion && (
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
