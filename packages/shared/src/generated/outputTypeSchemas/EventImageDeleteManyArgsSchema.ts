import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageWhereInputSchema } from '../inputTypeSchemas/EventImageWhereInputSchema'

export const EventImageDeleteManyArgsSchema: z.ZodType<Prisma.EventImageDeleteManyArgs> = z.object({
  where: EventImageWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventImageDeleteManyArgsSchema;
