import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { EventOccurrenceStatusSchema } from './EventOccurrenceStatusSchema';
import { EnumEventOccurrenceStatusFieldUpdateOperationsInputSchema } from './EnumEventOccurrenceStatusFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema } from './EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema';

export const EventOccurrenceUpdateWithoutBookingsInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateWithoutBookingsInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => EventOccurrenceStatusSchema), z.lazy(() => EnumEventOccurrenceStatusFieldUpdateOperationsInputSchema) ]).optional(),
  maxParticipants: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  currentParticipants: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.lazy(() => EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema).optional(),
});

export default EventOccurrenceUpdateWithoutBookingsInputSchema;
