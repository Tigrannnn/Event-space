import { ModalType } from '@/stores';
import type { MessageKey } from '@/lib/i18n/messages';

export interface AuthModalConfig {
	ariaLabel: MessageKey;
	title: MessageKey;
	subtitle: MessageKey;
	footerQuestion: MessageKey | '';
	footerAction: MessageKey | '';
	showGoogle: boolean;
}

export const authModalConfig: Partial<Record<ModalType, AuthModalConfig>> = {
	[ModalType.Login]: {
		ariaLabel: 'auth.loginAria',
		title: 'auth.welcomeBack',
		subtitle: 'auth.loginSubtitle',
		footerQuestion: 'auth.noAccount',
		footerAction: 'auth.signUp',
		showGoogle: true,
	},
	[ModalType.Register]: {
		ariaLabel: 'auth.registerAria',
		title: 'auth.registerTitle',
		subtitle: 'auth.registerSubtitle',
		footerQuestion: 'auth.hasAccount',
		footerAction: 'auth.logIn',
		showGoogle: true,
	},
	[ModalType.VerifyEmail]: {
		ariaLabel: 'auth.verifyEmailAria',
		title: 'auth.verifyEmailTitle',
		subtitle: 'auth.verifyEmailSubtitle',
		footerQuestion: '',
		footerAction: '',
		showGoogle: false,
	},
	[ModalType.ForgotPassword]: {
		ariaLabel: 'auth.forgotPasswordAria',
		title: 'auth.resetPasswordTitle',
		subtitle: 'auth.resetPasswordSubtitle',
		footerQuestion: 'auth.rememberPassword',
		footerAction: 'auth.logIn',
		showGoogle: false,
	},
};
