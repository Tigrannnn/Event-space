import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BannerThemeSchema } from './BannerThemeSchema';

export const EnumBannerThemeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumBannerThemeFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => BannerThemeSchema).optional(),
});

export default EnumBannerThemeFieldUpdateOperationsInputSchema;
