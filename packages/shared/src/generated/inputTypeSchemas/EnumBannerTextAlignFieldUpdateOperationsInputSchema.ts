import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTextAlignSchema } from './BannerTextAlignSchema';

export const EnumBannerTextAlignFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBannerTextAlignFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => BannerTextAlignSchema).optional(),
});

export default EnumBannerTextAlignFieldUpdateOperationsInputSchema;
