import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema } from './EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema';
import { BookingUpdateManyWithoutOccurrenceNestedInputSchema } from './BookingUpdateManyWithoutOccurrenceNestedInputSchema';

export const EventOccurrenceUpdateInputSchema: z.ZodType<Prisma.EventOccurrenceUpdateInput> = z.object({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  maxParticipants: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  currentParticipants: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.lazy(() => EventUpdateOneRequiredWithoutOccurrencesNestedInputSchema).optional(),
  bookings: z.lazy(() => BookingUpdateManyWithoutOccurrenceNestedInputSchema).optional(),
}).strict();

export default EventOccurrenceUpdateInputSchema;
