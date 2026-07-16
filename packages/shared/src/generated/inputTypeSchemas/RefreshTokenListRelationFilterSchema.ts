import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { RefreshTokenWhereInputSchema } from './RefreshTokenWhereInputSchema';

export const RefreshTokenListRelationFilterSchema: z.ZodType<Prisma.RefreshTokenListRelationFilter> = z.strictObject({
  every: z.lazy(() => RefreshTokenWhereInputSchema).optional(),
  some: z.lazy(() => RefreshTokenWhereInputSchema).optional(),
  none: z.lazy(() => RefreshTokenWhereInputSchema).optional(),
});

export default RefreshTokenListRelationFilterSchema;
