import { z } from '../openapi';

export const EmailSchema = z
	.string()
	.email('Invalid email format')
	.openapi({ example: 'user@example.com' });

export type Email = z.infer<typeof EmailSchema>;

export const NameSchema = z.string().min(2, 'Name is too short').openapi({ example: 'John Doe' });

export type Name = z.infer<typeof NameSchema>;

export const PasswordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(/[A-Z]/, 'Password must contain an uppercase letter')
	.regex(/[a-z]/, 'Password must contain a lowercase letter')
	.regex(/[0-9]/, 'Password must contain a digit')
	.openapi({ example: 'StrongPass1' });

export type Password = z.infer<typeof PasswordSchema>;

export const PhoneSchema = z
	.string()
	.min(5, 'Phone number is too short')
	.max(20, 'Phone number is too long')
	.openapi({ example: '+374 99 123 456' });

export type Phone = z.infer<typeof PhoneSchema>;
