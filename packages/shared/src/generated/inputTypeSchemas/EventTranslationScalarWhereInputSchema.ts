import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocaleFilterSchema } from './EnumLocaleFilterSchema';
import { LocaleSchema } from './LocaleSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';

export const EventTranslationScalarWhereInputSchema: z.ZodType<Prisma.EventTranslationScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => EventTranslationScalarWhereInputSchema), z.lazy(() => EventTranslationScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventTranslationScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventTranslationScalarWhereInputSchema), z.lazy(() => EventTranslationScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  locale: z.union([ z.lazy(() => EnumLocaleFilterSchema), z.lazy(() => LocaleSchema) ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  location: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  meetingLocation: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  whatsIncluded: z.lazy(() => StringNullableListFilterSchema).optional(),
});

export default EventTranslationScalarWhereInputSchema;
