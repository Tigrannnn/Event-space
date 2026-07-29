import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { FavoriteCreateWithoutEventInputSchema } from './FavoriteCreateWithoutEventInputSchema';
import { FavoriteUncheckedCreateWithoutEventInputSchema } from './FavoriteUncheckedCreateWithoutEventInputSchema';
import { FavoriteCreateOrConnectWithoutEventInputSchema } from './FavoriteCreateOrConnectWithoutEventInputSchema';
import { FavoriteCreateManyEventInputEnvelopeSchema } from './FavoriteCreateManyEventInputEnvelopeSchema';
import { FavoriteWhereUniqueInputSchema } from './FavoriteWhereUniqueInputSchema';

export const FavoriteUncheckedCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.FavoriteUncheckedCreateNestedManyWithoutEventInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoriteCreateWithoutEventInputSchema), z.lazy(() => FavoriteCreateWithoutEventInputSchema).array(), z.lazy(() => FavoriteUncheckedCreateWithoutEventInputSchema), z.lazy(() => FavoriteUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoriteCreateOrConnectWithoutEventInputSchema), z.lazy(() => FavoriteCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoriteCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoriteWhereUniqueInputSchema), z.lazy(() => FavoriteWhereUniqueInputSchema).array() ]).optional(),
});

export default FavoriteUncheckedCreateNestedManyWithoutEventInputSchema;
