import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationEventIdLocaleCompoundUniqueInputSchema } from './EventTranslationEventIdLocaleCompoundUniqueInputSchema';
import { EventTranslationWhereInputSchema } from './EventTranslationWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventTranslationWhereUniqueInputSchema: z.ZodType<Prisma.EventTranslationWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    eventId_locale: z.lazy(() => EventTranslationEventIdLocaleCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    eventId_locale: z.lazy(() => EventTranslationEventIdLocaleCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  eventId_locale: z.lazy(() => EventTranslationEventIdLocaleCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => EventTranslationWhereInputSchema), z.lazy(() => EventTranslationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventTranslationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventTranslationWhereInputSchema), z.lazy(() => EventTranslationWhereInputSchema).array() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  location: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  whatsIncluded: z.lazy(() => StringNullableListFilterSchema).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
}).strict());

export default EventTranslationWhereUniqueInputSchema;
