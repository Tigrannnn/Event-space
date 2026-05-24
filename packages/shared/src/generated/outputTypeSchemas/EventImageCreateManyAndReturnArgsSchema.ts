import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageCreateManyInputSchema } from '../inputTypeSchemas/EventImageCreateManyInputSchema'

export const EventImageCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EventImageCreateManyAndReturnArgs> = z.object({
  data: z.union([ EventImageCreateManyInputSchema, EventImageCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventImageCreateManyAndReturnArgsSchema;
