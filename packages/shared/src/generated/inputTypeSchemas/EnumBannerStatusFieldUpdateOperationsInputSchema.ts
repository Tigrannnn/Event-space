import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerStatusSchema } from './BannerStatusSchema';

export const EnumBannerStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBannerStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => BannerStatusSchema).optional(),
});

export default EnumBannerStatusFieldUpdateOperationsInputSchema;
