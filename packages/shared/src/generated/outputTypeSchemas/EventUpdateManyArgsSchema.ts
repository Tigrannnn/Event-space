import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventUpdateManyMutationInputSchema } from '../inputTypeSchemas/EventUpdateManyMutationInputSchema'
import { EventUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/EventUncheckedUpdateManyInputSchema'
import { EventWhereInputSchema } from '../inputTypeSchemas/EventWhereInputSchema'

export const EventUpdateManyArgsSchema: z.ZodType<Prisma.EventUpdateManyArgs> = z.object({
  data: z.union([ EventUpdateManyMutationInputSchema, EventUncheckedUpdateManyInputSchema ]),
  where: EventWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventUpdateManyArgsSchema;
