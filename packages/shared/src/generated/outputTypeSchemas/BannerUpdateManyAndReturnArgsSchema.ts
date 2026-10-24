import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerUpdateManyMutationInputSchema } from '../inputTypeSchemas/BannerUpdateManyMutationInputSchema'
import { BannerUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BannerUncheckedUpdateManyInputSchema'
import { BannerWhereInputSchema } from '../inputTypeSchemas/BannerWhereInputSchema'

export const BannerUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BannerUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BannerUpdateManyMutationInputSchema, BannerUncheckedUpdateManyInputSchema ]),
  where: BannerWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BannerUpdateManyAndReturnArgsSchema;
