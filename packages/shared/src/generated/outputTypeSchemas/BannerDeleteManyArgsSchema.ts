import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerWhereInputSchema } from '../inputTypeSchemas/BannerWhereInputSchema'

export const BannerDeleteManyArgsSchema: z.ZodType<Prisma.BannerDeleteManyArgs> = z.object({
  where: BannerWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BannerDeleteManyArgsSchema;
