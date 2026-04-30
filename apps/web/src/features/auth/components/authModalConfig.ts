import { ModalType } from '@/stores';

export interface AuthModalConfig {
  ariaLabel: string;
  title: string;
  subtitle: string;
  footerQuestion: string;
  footerAction: string;
  showGoogle: boolean;
}

export const authModalConfig: Partial<Record<ModalType, AuthModalConfig>> = {
  [ModalType.Login]: {
    ariaLabel: 'Login modal',
    title: 'Welcome Back',
    subtitle: 'Log in to continue your adventures.',
    footerQuestion: "Don't have an account?",
    footerAction: 'Sign up',
    showGoogle: true,
  },
  [ModalType.Register]: {
    ariaLabel: 'Register modal',
    title: 'Welcome to Event Space',
    subtitle: 'Create an account to join local adventures.',
    footerQuestion: 'Already have an account?',
    footerAction: 'Log in',
    showGoogle: true,
  },
  [ModalType.VerifyEmail]: {
    ariaLabel: 'Verify email modal',
    title: 'Verify Your Email',
    subtitle: 'Enter the 6-digit code sent to your email.',
    footerQuestion: '',
    footerAction: '',
    showGoogle: false,
  },
  [ModalType.ForgotPassword]: {
    ariaLabel: 'Forgot password modal',
    title: 'Reset Password',
    subtitle: 'Enter your email to receive a reset code.',
    footerQuestion: 'Remember your password?',
    footerAction: 'Log in',
    showGoogle: false,
  },
};
