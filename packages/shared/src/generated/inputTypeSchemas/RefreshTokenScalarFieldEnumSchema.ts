import { z } from 'zod';

export const RefreshTokenScalarFieldEnumSchema = z.enum(['id','hashedToken','userId','expiresAt','createdAt','updatedAt']);

export default RefreshTokenScalarFieldEnumSchema;
