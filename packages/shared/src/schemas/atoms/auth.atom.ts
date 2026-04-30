import { AuthAction } from '../../enums';
import { z } from '../openapi';

export const ActionSchema = z.nativeEnum(AuthAction).openapi({ example: AuthAction.REGISTER });

export type Action = z.infer<typeof ActionSchema>;

export const CodeSchema = z
	.string()
	.length(6, 'Verification code must be exactly 6 digits')
	.regex(/^\d{6}$/, 'Verification code must contain only digits')
	.openapi({ example: '123456' });

export type Code = z.infer<typeof CodeSchema>;
