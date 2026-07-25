import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventTranslationWhereInputSchema: z.ZodType<Prisma.EventTranslationWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EventTranslationWhereInputSchema), z.lazy(() => EventTranslationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventTranslationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventTranslationWhereInputSchema), z.lazy(() => EventTranslationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  location: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  meetingLocation: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  whatsIncluded: z.lazy(() => StringNullableListFilterSchema).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
});

export default EventTranslationWhereInputSchema;
