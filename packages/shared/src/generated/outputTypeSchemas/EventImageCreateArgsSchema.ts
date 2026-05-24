import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageIncludeSchema } from '../inputTypeSchemas/EventImageIncludeSchema'
import { EventImageCreateInputSchema } from '../inputTypeSchemas/EventImageCreateInputSchema'
import { EventImageUncheckedCreateInputSchema } from '../inputTypeSchemas/EventImageUncheckedCreateInputSchema'
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const EventImageCreateArgsSchema: z.ZodType<Prisma.EventImageCreateArgs> = z.object({
  select: EventImageSelectSchema.optional(),
  include: z.lazy(() => EventImageIncludeSchema).optional(),
  data: z.union([ EventImageCreateInputSchema, EventImageUncheckedCreateInputSchema ]),
}).strict();

export default EventImageCreateArgsSchema;
