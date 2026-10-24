import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerScalarWhereInputSchema } from './BannerScalarWhereInputSchema';
import { BannerUpdateManyMutationInputSchema } from './BannerUpdateManyMutationInputSchema';
import { BannerUncheckedUpdateManyWithoutEventInputSchema } from './BannerUncheckedUpdateManyWithoutEventInputSchema';

export const BannerUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.BannerUpdateManyWithWhereWithoutEventInput> = z.strictObject({
  where: z.lazy(() => BannerScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BannerUpdateManyMutationInputSchema), z.lazy(() => BannerUncheckedUpdateManyWithoutEventInputSchema) ]),
});

export default BannerUpdateManyWithWhereWithoutEventInputSchema;
