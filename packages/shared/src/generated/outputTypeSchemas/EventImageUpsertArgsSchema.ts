import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageIncludeSchema } from '../inputTypeSchemas/EventImageIncludeSchema'
import { EventImageWhereUniqueInputSchema } from '../inputTypeSchemas/EventImageWhereUniqueInputSchema'
import { EventImageCreateInputSchema } from '../inputTypeSchemas/EventImageCreateInputSchema'
import { EventImageUncheckedCreateInputSchema } from '../inputTypeSchemas/EventImageUncheckedCreateInputSchema'
import { EventImageUpdateInputSchema } from '../inputTypeSchemas/EventImageUpdateInputSchema'
import { EventImageUncheckedUpdateInputSchema } from '../inputTypeSchemas/EventImageUncheckedUpdateInputSchema'
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

export const EventImageUpsertArgsSchema: z.ZodType<Prisma.EventImageUpsertArgs> = z.object({
  select: EventImageSelectSchema.optional(),
  include: z.lazy(() => EventImageIncludeSchema).optional(),
  where: EventImageWhereUniqueInputSchema, 
  create: z.union([ EventImageCreateInputSchema, EventImageUncheckedCreateInputSchema ]),
  update: z.union([ EventImageUpdateInputSchema, EventImageUncheckedUpdateInputSchema ]),
}).strict();

export default EventImageUpsertArgsSchema;
