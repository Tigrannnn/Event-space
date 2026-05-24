import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"

export const EventImageIncludeSchema: z.ZodType<Prisma.EventImageInclude> = z.object({
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
}).strict();

export default EventImageIncludeSchema;
