import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventDifficultySchema } from './EventDifficultySchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EventCreatewhatsIncludedInputSchema } from './EventCreatewhatsIncludedInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EventImageUncheckedCreateNestedManyWithoutEventInputSchema } from './EventImageUncheckedCreateNestedManyWithoutEventInputSchema';
import { CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema } from './CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema';

export const EventUncheckedCreateWithoutBookingsInputSchema: z.ZodType<Prisma.EventUncheckedCreateWithoutBookingsInput> = z.object({
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
  userId: z.string(),
  images: z.lazy(() => EventImageUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUncheckedCreateNestedManyWithoutEventInputSchema).optional(),
}).strict();

export default EventUncheckedCreateWithoutBookingsInputSchema;
