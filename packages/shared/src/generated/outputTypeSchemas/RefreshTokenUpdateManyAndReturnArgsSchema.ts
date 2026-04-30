import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { RefreshTokenUpdateManyMutationInputSchema } from '../inputTypeSchemas/RefreshTokenUpdateManyMutationInputSchema'
import { RefreshTokenUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RefreshTokenUncheckedUpdateManyInputSchema'
import { RefreshTokenWhereInputSchema } from '../inputTypeSchemas/RefreshTokenWhereInputSchema'

export const RefreshTokenUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RefreshTokenUpdateManyAndReturnArgs> = z.object({
  data: z.union([ RefreshTokenUpdateManyMutationInputSchema, RefreshTokenUncheckedUpdateManyInputSchema ]),
  where: RefreshTokenWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default RefreshTokenUpdateManyAndReturnArgsSchema;
