import { z } from 'zod';
import { UserRoleSchema } from '../inputTypeSchemas/UserRoleSchema'

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  role: UserRoleSchema,
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  passwordHash: z.string().nullable(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  isShadow: z.boolean(),
  phone: z.string().nullable(),
  googleId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

export default UserSchema;
