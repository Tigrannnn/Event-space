import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { CategoryOrderByWithRelationInputSchema } from './CategoryOrderByWithRelationInputSchema';
import { EventOccurrenceOrderByRelationAggregateInputSchema } from './EventOccurrenceOrderByRelationAggregateInputSchema';
import { EventImageOrderByRelationAggregateInputSchema } from './EventImageOrderByRelationAggregateInputSchema';
import { FavoriteOrderByRelationAggregateInputSchema } from './FavoriteOrderByRelationAggregateInputSchema';
import { BannerOrderByRelationAggregateInputSchema } from './BannerOrderByRelationAggregateInputSchema';
import { CancellationPolicyRuleOrderByRelationAggregateInputSchema } from './CancellationPolicyRuleOrderByRelationAggregateInputSchema';
import { EventTranslationOrderByRelationAggregateInputSchema } from './EventTranslationOrderByRelationAggregateInputSchema';

export const EventOrderByWithRelationInputSchema: z.ZodType<Prisma.EventOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  locationUrl: z.lazy(() => SortOrderSchema).optional(),
  meetingLocationUrl: z.lazy(() => SortOrderSchema).optional(),
  difficulty: z.lazy(() => SortOrderSchema).optional(),
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
  favorites: z.lazy(() => FavoriteOrderByRelationAggregateInputSchema).optional(),
  banners: z.lazy(() => BannerOrderByRelationAggregateInputSchema).optional(),
  cancellationRules: z.lazy(() => CancellationPolicyRuleOrderByRelationAggregateInputSchema).optional(),
  translations: z.lazy(() => EventTranslationOrderByRelationAggregateInputSchema).optional(),
});

export default EventOrderByWithRelationInputSchema;
