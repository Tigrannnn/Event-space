import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const BannerCountOutputTypeSelectSchema: z.ZodType<Prisma.BannerCountOutputTypeSelect> = z.object({
  translations: z.boolean().optional(),
}).strict();

export default BannerCountOutputTypeSelectSchema;
