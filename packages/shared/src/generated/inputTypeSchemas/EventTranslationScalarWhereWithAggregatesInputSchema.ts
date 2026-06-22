import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumLocaleWithAggregatesFilterSchema } from './EnumLocaleWithAggregatesFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';

export const EventTranslationScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.EventTranslationScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => EventTranslationScalarWhereWithAggregatesInputSchema), z.lazy(() => EventTranslationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventTranslationScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventTranslationScalarWhereWithAggregatesInputSchema), z.lazy(() => EventTranslationScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleWithAggregatesFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  location: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  category: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  whatsIncluded: z.lazy(() => StringNullableListFilterSchema).optional(),
}).strict();

export default EventTranslationScalarWhereWithAggregatesInputSchema;
