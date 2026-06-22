import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { BookingOrderByRelationAggregateInputSchema } from './BookingOrderByRelationAggregateInputSchema';
import { EventImageOrderByRelationAggregateInputSchema } from './EventImageOrderByRelationAggregateInputSchema';
import { CancellationPolicyRuleOrderByRelationAggregateInputSchema } from './CancellationPolicyRuleOrderByRelationAggregateInputSchema';
import { EventTranslationOrderByRelationAggregateInputSchema } from './EventTranslationOrderByRelationAggregateInputSchema';

export const EventOrderByWithRelationInputSchema: z.ZodType<Prisma.EventOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  locationUrl: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  date: z.lazy(() => SortOrderSchema).optional(),
  difficulty: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  maxParticipants: z.lazy(() => SortOrderSchema).optional(),
  currentParticipants: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  organizer: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  bookings: z.lazy(() => BookingOrderByRelationAggregateInputSchema).optional(),
  images: z.lazy(() => EventImageOrderByRelationAggregateInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleOrderByRelationAggregateInputSchema).optional(),
  translations: z.lazy(() => EventTranslationOrderByRelationAggregateInputSchema).optional(),
}).strict();

export default EventOrderByWithRelationInputSchema;
