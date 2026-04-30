import { AuthResponse } from '@event-space/shared';

export interface AuthServiceResponse extends AuthResponse {
	refreshToken: string;
	accessToken: string;
}

export interface TokenServiceResponse {
	refreshToken: string;
	accessToken: string;
}
