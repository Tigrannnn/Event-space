import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageUpdateManyMutationInputSchema } from '../inputTypeSchemas/EventImageUpdateManyMutationInputSchema'
import { EventImageUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/EventImageUncheckedUpdateManyInputSchema'
import { EventImageWhereInputSchema } from '../inputTypeSchemas/EventImageWhereInputSchema'

export const EventImageUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.EventImageUpdateManyAndReturnArgs> = z.object({
  data: z.union([ EventImageUpdateManyMutationInputSchema, EventImageUncheckedUpdateManyInputSchema ]),
  where: EventImageWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventImageUpdateManyAndReturnArgsSchema;
