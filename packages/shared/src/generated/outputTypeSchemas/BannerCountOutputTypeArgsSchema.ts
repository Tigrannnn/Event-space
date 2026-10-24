import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerCountOutputTypeSelectSchema } from './BannerCountOutputTypeSelectSchema';

export const BannerCountOutputTypeArgsSchema: z.ZodType<Prisma.BannerCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BannerCountOutputTypeSelectSchema).nullish(),
}).strict();

export default BannerCountOutputTypeSelectSchema;
