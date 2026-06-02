import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { OutboxStatusSchema } from './OutboxStatusSchema';

export const OutboxEventCreateManyInputSchema: z.ZodType<Prisma.OutboxEventCreateManyInput> = z.object({
  id: z.cuid().optional(),
  action: z.string(),
  payload: z.union([ z.lazy(() => JsonNullValueInputSchema), InputJsonValueSchema ]),
  status: z.lazy(() => OutboxStatusSchema).optional(),
  attempts: z.number().int().optional(),
  lastError: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  processedAt: z.coerce.date().optional().nullable(),
}).strict();

export default OutboxEventCreateManyInputSchema;
