import { SafeUserData } from '../schemas/user.schema';

/**
 * Auth responses carry no message: the client knows which call it made and shows its own
 * text for it, in the user's language. Endpoints that have nothing else to return send an
 * empty body.
 */
export interface AuthResponse {
	user: SafeUserData;
}

export interface RegisterResponse {
	userId: string;
}
