import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventCreateManyInputSchema } from '../inputTypeSchemas/EventCreateManyInputSchema'

export const EventCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EventCreateManyAndReturnArgs> = z.object({
  data: z.union([ EventCreateManyInputSchema, EventCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventCreateManyAndReturnArgsSchema;
