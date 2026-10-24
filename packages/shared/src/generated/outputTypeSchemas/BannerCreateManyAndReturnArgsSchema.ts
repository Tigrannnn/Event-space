import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerCreateManyInputSchema } from '../inputTypeSchemas/BannerCreateManyInputSchema'

export const BannerCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BannerCreateManyAndReturnArgs> = z.object({
  data: z.union([ BannerCreateManyInputSchema, BannerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BannerCreateManyAndReturnArgsSchema;
