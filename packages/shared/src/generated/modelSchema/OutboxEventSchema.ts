import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { OutboxStatusSchema } from '../inputTypeSchemas/OutboxStatusSchema'

/////////////////////////////////////////
// OUTBOX EVENT SCHEMA
/////////////////////////////////////////

export const OutboxEventSchema = z.object({
  status: OutboxStatusSchema,
  id: z.cuid(),
  action: z.string(),
  payload: JsonValueSchema,
  attempts: z.number().int(),
  lastError: z.string().nullable(),
  createdAt: z.coerce.date(),
  processedAt: z.coerce.date().nullable(),
})

export type OutboxEvent = z.infer<typeof OutboxEventSchema>

export default OutboxEventSchema;
