import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { EventUpdateOneRequiredWithoutFavoritesNestedInputSchema } from './EventUpdateOneRequiredWithoutFavoritesNestedInputSchema';

export const FavoriteUpdateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.uuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  event: z.lazy(() => EventUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
});

export default FavoriteUpdateWithoutUserInputSchema;
