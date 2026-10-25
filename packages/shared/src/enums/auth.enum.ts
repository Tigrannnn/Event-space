export enum AuthAction {
	REGISTER = 'register',
	LOGIN = 'login',
	RESET_PASSWORD = 'reset-password',
	CHANGE_EMAIL = 'change-email',
}

export enum AuthKeyType {
	OTP = 'otp',
	COOLDOWN = 'cooldown',
	ATTEMPTS = 'attempts',
}
