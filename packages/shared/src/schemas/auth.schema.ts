import { z } from './openapi';
import { ActionSchema, CodeSchema, EmailSchema, NameSchema, PasswordSchema } from './atoms';

// === REGISTER ===
export const RegisterSchema = z.object({
	email: EmailSchema,
	password: PasswordSchema,
	name: NameSchema,
});

export type RegisterData = z.infer<typeof RegisterSchema>;

// === RESEND CODE ===
export const ResendCodeSchema = z.object({
	email: EmailSchema,
	action: ActionSchema,
});

export type ResendCodeData = z.infer<typeof ResendCodeSchema>;

// === VERIFY EMAIL ===
export const VerifyEmailSchema = z.object({
	email: EmailSchema,
	code: CodeSchema,
});

export type VerifyEmailData = z.infer<typeof VerifyEmailSchema>;

// === LOGIN ===
export const LoginSchema = z.object({
	email: EmailSchema,
	password: PasswordSchema,
});

export type LoginData = z.infer<typeof LoginSchema>;

// === GOOGLE LOGIN ===
export const GoogleLoginSchema = z.object({
	token: z.string(),
});

export type GoogleLoginData = z.infer<typeof GoogleLoginSchema>;

// === FORGOT PASSWORD ===
export const ForgotPasswordSchema = z.object({
	email: EmailSchema,
});

export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

// === RESET PASSWORD ===
export const ResetPasswordSchema = z.object({
	email: EmailSchema,
	newPassword: PasswordSchema,
	code: CodeSchema,
});

export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

// === LOGOUT ===
export const LogoutSchema = z.object({
	refreshToken: z.string().min(1),
});

export type LogoutData = z.infer<typeof LogoutSchema>;
