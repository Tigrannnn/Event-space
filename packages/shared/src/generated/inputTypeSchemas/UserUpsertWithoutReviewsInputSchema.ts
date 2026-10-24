import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { UserUpdateWithoutReviewsInputSchema } from './UserUpdateWithoutReviewsInputSchema';
import { UserUncheckedUpdateWithoutReviewsInputSchema } from './UserUncheckedUpdateWithoutReviewsInputSchema';
import { UserCreateWithoutReviewsInputSchema } from './UserCreateWithoutReviewsInputSchema';
import { UserUncheckedCreateWithoutReviewsInputSchema } from './UserUncheckedCreateWithoutReviewsInputSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const UserUpsertWithoutReviewsInputSchema: z.ZodType<Prisma.UserUpsertWithoutReviewsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UserUpdateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedUpdateWithoutReviewsInputSchema) ]),
  create: z.union([ z.lazy(() => UserCreateWithoutReviewsInputSchema), z.lazy(() => UserUncheckedCreateWithoutReviewsInputSchema) ]),
  where: z.lazy(() => UserWhereInputSchema).optional(),
});

export default UserUpsertWithoutReviewsInputSchema;
