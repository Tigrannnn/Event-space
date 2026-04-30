import { SafeUserData } from '../schemas/user.schema';

export interface AuthResponse {
	message: string;
	user: SafeUserData;
}

export interface RegisterResponse {
	message: string;
	userId: string;
}

export interface MessageResponse {
	message: string;
}
