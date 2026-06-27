import { z } from './openapi';
import { UserSchema as GeneratedUser } from '../generated/modelSchema/UserSchema';
import { EmailSchema, NameSchema, PhoneSchema } from './atoms';
import { UserRoleSchema } from '../generated/inputTypeSchemas/UserRoleSchema';

/**
 * Main User schema for public API responses.
 * We extend the Prisma-generated schema to include our atomic validation
 * and Swagger examples.
 */
export const UserSchema = GeneratedUser.extend({
	email: EmailSchema,
	name: NameSchema,
	phone: PhoneSchema.optional().nullable(),
}).openapi({
	description: 'Full user information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440000',
		email: 'user@example.com',
		name: 'John Doe',
		phone: '+374 99 123 456',
		role: UserRoleSchema.enum.USER,
		emailVerified: true,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
});

export type UserData = z.infer<typeof UserSchema>;

/**
 * Safe version of the user schema that excludes sensitive data.
 * Useful for public profile endpoints.
 */
export const SafeUserSchema = UserSchema.omit({
	passwordHash: true,
	googleId: true,
}).openapi({
	description: 'User information without sensitive fields',
});

export type SafeUserData = z.infer<typeof SafeUserSchema>;

export { UserRoleSchema };
export type UserRoleType = z.infer<typeof UserRoleSchema>;

export const UserFiltersSchema = z.object({
	skip: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	search: z.string().optional(),
	role: UserRoleSchema.optional(),
	emailVerified: z.coerce.boolean().optional(),
});

export type UserFilters = z.infer<typeof UserFiltersSchema>;

export const CreateUserSchema = UserSchema.omit({
	createdAt: true,
	updatedAt: true,
	id: true,
});

export const UpdateUserSchema = z.object({
	name: NameSchema.optional(),
	phone: PhoneSchema.optional().nullable(),
});

export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
