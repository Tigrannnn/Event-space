import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '@prisma/client'
import { EventDifficultySchema } from '../inputTypeSchemas/EventDifficultySchema'
import { EventStatusSchema } from '../inputTypeSchemas/EventStatusSchema'

/////////////////////////////////////////
// EVENT SCHEMA
/////////////////////////////////////////

export const EventSchema = z.object({
  difficulty: EventDifficultySchema,
  status: EventStatusSchema,
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.coerce.date(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'Event']"}),
  maxParticipants: z.number().int(),
  currentParticipants: z.number().int(),
  category: z.string(),
  whatsIncluded: z.string().array(),
  duration: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  cancellationPolicy: JsonValueSchema.nullable(),
})

export type Event = z.infer<typeof EventSchema>

export default EventSchema;
