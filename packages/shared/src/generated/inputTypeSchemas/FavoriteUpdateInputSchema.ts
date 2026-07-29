import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutFavoritesNestedInputSchema } from './UserUpdateOneRequiredWithoutFavoritesNestedInputSchema';
import { EventUpdateOneRequiredWithoutFavoritesNestedInputSchema } from './EventUpdateOneRequiredWithoutFavoritesNestedInputSchema';

export const FavoriteUpdateInputSchema: z.ZodType<Prisma.FavoriteUpdateInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
  event: z.lazy(() => EventUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
});

export default FavoriteUpdateInputSchema;
