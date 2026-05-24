import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventCreatewhatsIncludedInputSchema } from './EventCreatewhatsIncludedInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { BookingCreateNestedManyWithoutEventInputSchema } from './BookingCreateNestedManyWithoutEventInputSchema';
import { EventImageCreateNestedManyWithoutEventInputSchema } from './EventImageCreateNestedManyWithoutEventInputSchema';

export const EventCreateWithoutOrganizerInputSchema: z.ZodType<Prisma.EventCreateWithoutOrganizerInput> = z.object({
  id: z.uuid().optional(),
  title: z.string(),
  description: z.string(),
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
  bookings: z.lazy(() => BookingCreateNestedManyWithoutEventInputSchema).optional(),
  images: z.lazy(() => EventImageCreateNestedManyWithoutEventInputSchema).optional(),
}).strict();

export default EventCreateWithoutOrganizerInputSchema;
