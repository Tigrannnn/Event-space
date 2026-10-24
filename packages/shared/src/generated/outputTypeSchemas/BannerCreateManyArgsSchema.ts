import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerCreateManyInputSchema } from '../inputTypeSchemas/BannerCreateManyInputSchema'

export const BannerCreateManyArgsSchema: z.ZodType<Prisma.BannerCreateManyArgs> = z.object({
  data: z.union([ BannerCreateManyInputSchema, BannerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BannerCreateManyArgsSchema;
