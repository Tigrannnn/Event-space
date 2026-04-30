import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateimagesInputSchema } from './EventCreateimagesInputSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventCreatewhatsIncludedInputSchema } from './EventCreatewhatsIncludedInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { UserCreateNestedOneWithoutEventsInputSchema } from './UserCreateNestedOneWithoutEventsInputSchema';

export const EventCreateWithoutBookingsInputSchema: z.ZodType<Prisma.EventCreateWithoutBookingsInput> = z.object({
  id: z.uuid().optional(),
  title: z.string(),
  description: z.string(),
  images: z.union([ z.lazy(() => EventCreateimagesInputSchema), z.string().array() ]).optional(),
  location: z.string(),
  date: z.coerce.date(),
  difficulty: z.lazy(() => EventDifficultySchema),
  price: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  maxParticipants: z.number().int().optional(),
  currentParticipants: z.number().int().optional(),
  category: z.string(),
  whatsIncluded: z.union([ z.lazy(() => EventCreatewhatsIncludedInputSchema), z.string().array() ]).optional(),
  duration: z.number().int(),
  status: z.lazy(() => EventStatusSchema).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  organizer: z.lazy(() => UserCreateNestedOneWithoutEventsInputSchema),
}).strict();

export default EventCreateWithoutBookingsInputSchema;
