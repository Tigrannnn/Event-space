import { z } from 'zod';

/////////////////////////////////////////
// SOURCE SCHEMA
/////////////////////////////////////////

export const SourceSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  nameKey: z.string(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Source = z.infer<typeof SourceSchema>

export default SourceSchema;
