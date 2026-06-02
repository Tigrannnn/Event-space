import { z } from 'zod';

/////////////////////////////////////////
// REFRESH TOKEN SCHEMA
/////////////////////////////////////////

export const RefreshTokenSchema = z.object({
  id: z.uuid(),
  hashedToken: z.string(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type RefreshToken = z.infer<typeof RefreshTokenSchema>

export default RefreshTokenSchema;
