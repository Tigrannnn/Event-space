export enum AuthAction {
	REGISTER = 'register',
	LOGIN = 'login',
	RESET_PASSWORD = 'reset-password',
}

export enum AuthKeyType {
	OTP = 'otp',
	COOLDOWN = 'cooldown',
	ATTEMPTS = 'attempts',
}
