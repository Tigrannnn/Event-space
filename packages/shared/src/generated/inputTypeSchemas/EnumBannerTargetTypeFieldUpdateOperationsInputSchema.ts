import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerTargetTypeSchema } from './BannerTargetTypeSchema';

export const EnumBannerTargetTypeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBannerTargetTypeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => BannerTargetTypeSchema).optional(),
});

export default EnumBannerTargetTypeFieldUpdateOperationsInputSchema;
