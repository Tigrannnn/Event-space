import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventCreatewhatsIncludedInputSchema } from './EventCreatewhatsIncludedInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { UserCreateNestedOneWithoutEventsInputSchema } from './UserCreateNestedOneWithoutEventsInputSchema';
import { EventImageCreateNestedManyWithoutEventInputSchema } from './EventImageCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema';

export const EventCreateWithoutBookingsInputSchema: z.ZodType<Prisma.EventCreateWithoutBookingsInput> = z.object({
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
  organizer: z.lazy(() => UserCreateNestedOneWithoutEventsInputSchema),
  images: z.lazy(() => EventImageCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleCreateNestedManyWithoutEventInputSchema).optional(),
}).strict();

export default EventCreateWithoutBookingsInputSchema;
