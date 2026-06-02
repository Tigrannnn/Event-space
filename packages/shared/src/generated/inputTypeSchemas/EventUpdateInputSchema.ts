import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { EventDifficultySchema } from './EventDifficultySchema';
import { EnumEventDifficultyFieldUpdateOperationsInputSchema } from './EnumEventDifficultyFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { EventUpdatewhatsIncludedInputSchema } from './EventUpdatewhatsIncludedInputSchema';
import { EventStatusSchema } from './EventStatusSchema';
import { EnumEventStatusFieldUpdateOperationsInputSchema } from './EnumEventStatusFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutEventsNestedInputSchema } from './UserUpdateOneRequiredWithoutEventsNestedInputSchema';
import { BookingUpdateManyWithoutEventNestedInputSchema } from './BookingUpdateManyWithoutEventNestedInputSchema';
import { EventImageUpdateManyWithoutEventNestedInputSchema } from './EventImageUpdateManyWithoutEventNestedInputSchema';
import { CancellationPolicyRuleUpdateManyWithoutEventNestedInputSchema } from './CancellationPolicyRuleUpdateManyWithoutEventNestedInputSchema';

export const EventUpdateInputSchema: z.ZodType<Prisma.EventUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  location: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  difficulty: z.union([ z.lazy(() => EventDifficultySchema), z.lazy(() => EnumEventDifficultyFieldUpdateOperationsInputSchema) ]).optional(),
  price: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => DecimalFieldUpdateOperationsInputSchema) ]).optional(),
  maxParticipants: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  currentParticipants: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  category: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  whatsIncluded: z.union([ z.lazy(() => EventUpdatewhatsIncludedInputSchema), z.string().array() ]).optional(),
  duration: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => EventStatusSchema), z.lazy(() => EnumEventStatusFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  organizer: z.lazy(() => UserUpdateOneRequiredWithoutEventsNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutEventNestedInputSchema).optional(),
  images: z.lazy(() => EventImageUpdateManyWithoutEventNestedInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleUpdateManyWithoutEventNestedInputSchema).optional(),
}).strict();

export default EventUpdateInputSchema;
