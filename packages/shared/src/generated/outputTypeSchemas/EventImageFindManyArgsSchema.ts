import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageIncludeSchema } from '../inputTypeSchemas/EventImageIncludeSchema'
import { EventImageWhereInputSchema } from '../inputTypeSchemas/EventImageWhereInputSchema'
import { EventImageOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventImageOrderByWithRelationInputSchema'
import { EventImageWhereUniqueInputSchema } from '../inputTypeSchemas/EventImageWhereUniqueInputSchema'
import { EventImageScalarFieldEnumSchema } from '../inputTypeSchemas/EventImageScalarFieldEnumSchema'
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

export const EventImageFindManyArgsSchema: z.ZodType<Prisma.EventImageFindManyArgs> = z.object({
  select: EventImageSelectSchema.optional(),
  include: z.lazy(() => EventImageIncludeSchema).optional(),
  where: EventImageWhereInputSchema.optional(), 
  orderBy: z.union([ EventImageOrderByWithRelationInputSchema.array(), EventImageOrderByWithRelationInputSchema ]).optional(),
  cursor: EventImageWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ EventImageScalarFieldEnumSchema, EventImageScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default EventImageFindManyArgsSchema;
