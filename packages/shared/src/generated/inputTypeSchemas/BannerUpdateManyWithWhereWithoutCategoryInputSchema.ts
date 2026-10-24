import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerScalarWhereInputSchema } from './BannerScalarWhereInputSchema';
import { BannerUpdateManyMutationInputSchema } from './BannerUpdateManyMutationInputSchema';
import { BannerUncheckedUpdateManyWithoutCategoryInputSchema } from './BannerUncheckedUpdateManyWithoutCategoryInputSchema';

export const BannerUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.BannerUpdateManyWithWhereWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => BannerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BannerUpdateManyMutationInputSchema), z.lazy(() => BannerUncheckedUpdateManyWithoutCategoryInputSchema) ]),
});

export default BannerUpdateManyWithWhereWithoutCategoryInputSchema;
