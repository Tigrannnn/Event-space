import { z } from 'zod';

/////////////////////////////////////////
// SOURCE VISIT SCHEMA
/////////////////////////////////////////

export const SourceVisitSchema = z.object({
  id: z.uuid(),
  sourceId: z.string().nullable(),
  ref: z.string(),
  createdAt: z.coerce.date(),
})

export type SourceVisit = z.infer<typeof SourceVisitSchema>

export default SourceVisitSchema;
