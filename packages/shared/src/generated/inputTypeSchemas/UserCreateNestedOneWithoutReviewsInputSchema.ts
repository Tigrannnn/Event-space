import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutReviewsInputSchema } from './UserCreateWithoutReviewsInputSchema';
import { UserUncheckedCreateWithoutReviewsInputSchema } from './UserUncheckedCreateWithoutReviewsInputSchema';
import { UserCreateOrConnectWithoutReviewsInputSchema } from './UserCreateOrConnectWithoutReviewsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';

export const UserCreateNestedOneWithoutReviewsInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutReviewsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
});

export default UserCreateNestedOneWithoutReviewsInputSchema;
