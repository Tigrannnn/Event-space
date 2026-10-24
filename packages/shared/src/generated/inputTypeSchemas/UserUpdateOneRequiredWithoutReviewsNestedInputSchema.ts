import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserCreateWithoutReviewsInputSchema } from './UserCreateWithoutReviewsInputSchema';
import { UserUncheckedCreateWithoutReviewsInputSchema } from './UserUncheckedCreateWithoutReviewsInputSchema';
import { UserCreateOrConnectWithoutReviewsInputSchema } from './UserCreateOrConnectWithoutReviewsInputSchema';
import { UserUpsertWithoutReviewsInputSchema } from './UserUpsertWithoutReviewsInputSchema';
import { UserWhereUniqueInputSchema } from './UserWhereUniqueInputSchema';
import { UserUpdateToOneWithWhereWithoutReviewsInputSchema } from './UserUpdateToOneWithWhereWithoutReviewsInputSchema';
import { UserUpdateWithoutReviewsInputSchema } from './UserUpdateWithoutReviewsInputSchema';
import { UserUncheckedUpdateWithoutReviewsInputSchema } from './UserUncheckedUpdateWithoutReviewsInputSchema';

export const UserUpdateOneRequiredWithoutReviewsNestedInputSchema: z.ZodType<Prisma.UserUpdateOneRequiredWithoutReviewsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutReviewsInputSchema).optional(),
  upsert: z.lazy(() => UserUpsertWithoutReviewsInputSchema).optional(),
  connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UserUpdateToOneWithWhereWithoutReviewsInputSchema), z.lazy(() => UserUpdateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutReviewsInputSchema) ]).optional(),
});

export default UserUpdateOneRequiredWithoutReviewsNestedInputSchema;
