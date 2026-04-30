// API
export { authApi } from './api/auth.api';

// Hooks
export {
	useRegister,
	useVerifyEmail,
	useResendCode,
	useLogin,
	useForgotPassword,
	useResetPassword,
	useLogout,
} from './hooks/useAuth';
export { useCooldown } from './hooks/useCooldown';

// Components
export { default as AuthModal } from './components/AuthModal';
export { default as LoginForm } from './components/LoginForm';
export { default as RegisterForm } from './components/RegisterForm';
export { default as VerifyEmailForm } from './components/VerifyEmailForm';
export { default as ForgotPasswordForm } from './components/ForgotPasswordForm';

// Types
export type { UseCooldownReturn } from './types/cooldown.types';
