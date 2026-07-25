import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { CategoryOrderByWithRelationInputSchema } from './CategoryOrderByWithRelationInputSchema';
import { EventOccurrenceOrderByRelationAggregateInputSchema } from './EventOccurrenceOrderByRelationAggregateInputSchema';
import { EventImageOrderByRelationAggregateInputSchema } from './EventImageOrderByRelationAggregateInputSchema';
import { CancellationPolicyRuleOrderByRelationAggregateInputSchema } from './CancellationPolicyRuleOrderByRelationAggregateInputSchema';
import { EventTranslationOrderByRelationAggregateInputSchema } from './EventTranslationOrderByRelationAggregateInputSchema';

export const EventOrderByWithRelationInputSchema: z.ZodType<Prisma.EventOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  locationUrl: z.lazy(() => SortOrderSchema).optional(),
  meetingLocationUrl: z.lazy(() => SortOrderSchema).optional(),
  difficulty: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  price: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  organizer: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  category: z.lazy(() => CategoryOrderByWithRelationInputSchema).optional(),
  occurrences: z.lazy(() => EventOccurrenceOrderByRelationAggregateInputSchema).optional(),
  images: z.lazy(() => EventImageOrderByRelationAggregateInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleOrderByRelationAggregateInputSchema).optional(),
  translations: z.lazy(() => EventTranslationOrderByRelationAggregateInputSchema).optional(),
});

export default EventOrderByWithRelationInputSchema;
