import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventTranslationWhereInputSchema } from './EventTranslationWhereInputSchema';

export const EventTranslationListRelationFilterSchema: z.ZodType<Prisma.EventTranslationListRelationFilter> = z.object({
  every: z.lazy(() => EventTranslationWhereInputSchema).optional(),
  some: z.lazy(() => EventTranslationWhereInputSchema).optional(),
  none: z.lazy(() => EventTranslationWhereInputSchema).optional(),
}).strict();

export default EventTranslationListRelationFilterSchema;
