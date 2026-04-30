import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventCreateManyInputSchema } from '../inputTypeSchemas/EventCreateManyInputSchema'

export const EventCreateManyArgsSchema: z.ZodType<Prisma.EventCreateManyArgs> = z.object({
  data: z.union([ EventCreateManyInputSchema, EventCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventCreateManyArgsSchema;
