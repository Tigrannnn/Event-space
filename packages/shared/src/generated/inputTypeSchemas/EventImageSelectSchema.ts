import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"

export const EventImageSelectSchema: z.ZodType<Prisma.EventImageSelect> = z.object({
  id: z.boolean().optional(),
  eventId: z.boolean().optional(),
  url: z.boolean().optional(),
  publicId: z.boolean().optional(),
  order: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict()

export default EventImageSelectSchema;
