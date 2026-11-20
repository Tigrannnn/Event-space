import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id','email','name','passwordHash','image','role','emailVerified','isShadow','phone','locale','googleId','sourceId','createdAt','updatedAt']);

export default UserScalarFieldEnumSchema;
