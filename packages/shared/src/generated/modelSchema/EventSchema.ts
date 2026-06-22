import { z } from 'zod';
import { Prisma } from '@prisma/client'
import { EventDifficultySchema } from '../inputTypeSchemas/EventDifficultySchema'
import { EventStatusSchema } from '../inputTypeSchemas/EventStatusSchema'

/////////////////////////////////////////
// EVENT SCHEMA
/////////////////////////////////////////

export const EventSchema = z.object({
  difficulty: EventDifficultySchema.nullable(),
  status: EventStatusSchema,
  id: z.uuid(),
  locationUrl: z.string().nullable(),
  date: z.coerce.date(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'Event']"}),
  maxParticipants: z.number().int(),
  currentParticipants: z.number().int(),
  duration: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
})

export type Event = z.infer<typeof EventSchema>

export default EventSchema;
