import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventStatusSchema } from './EventStatusSchema';

export const EventCreateManyOrganizerInputSchema: z.ZodType<Prisma.EventCreateManyOrganizerInput> = z.object({
  id: z.uuid().optional(),
  locationUrl: z.string().optional().nullable(),
  date: z.coerce.date(),
  difficulty: z.lazy(() => EventDifficultySchema).optional().nullable(),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  categoryId: z.string(),
}).strict();

export default EventCreateManyOrganizerInputSchema;
