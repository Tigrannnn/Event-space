import { z } from 'zod';

/////////////////////////////////////////
// FAVORITE SCHEMA
/////////////////////////////////////////

export const FavoriteSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  eventId: z.string(),
  createdAt: z.coerce.date(),
})

export type Favorite = z.infer<typeof FavoriteSchema>

export default FavoriteSchema;
