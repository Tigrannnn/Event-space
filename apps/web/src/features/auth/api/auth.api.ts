import clientApi from '@/lib/client.api';
import {
	AuthResponse,
	ConfirmEmailChangeData,
	ForgotPasswordData,
	RequestEmailChangeData,
	SafeUserData,
	GoogleLoginData,
	LoginData,
	RegisterData,
	RegisterResponse,
	ResendCodeData,
	ResetPasswordData,
	VerifyEmailData,
} from '@event-space/shared';

export const authApi = {
	register: (data: RegisterData) => clientApi.post<RegisterResponse>('/auth/register', data),

	verifyEmail: (data: VerifyEmailData) => clientApi.post<AuthResponse>('/auth/verify-email', data),

	resendCode: (data: ResendCodeData) => clientApi.post<void>('/auth/resend-code', data),

	login: (data: LoginData) => clientApi.post<AuthResponse>('/auth/login', data),

	googleLogin: (data: GoogleLoginData) => clientApi.post<AuthResponse>('/auth/google', data),

	forgotPassword: (data: ForgotPasswordData) =>
		clientApi.post<void>('/auth/forgot-password', data),

	resetPassword: (data: ResetPasswordData) =>
		clientApi.post<AuthResponse>('/auth/reset-password', data),

	requestEmailChange: (data: RequestEmailChangeData) =>
		clientApi.post<void>('/auth/email/change', data),

	confirmEmailChange: (data: ConfirmEmailChangeData) =>
		clientApi.post<SafeUserData>('/auth/email/confirm', data),

	refreshTokens: () => clientApi.post<void>('/auth/refresh'),

	logout: () => clientApi.post<void>('/auth/logout'),
};
