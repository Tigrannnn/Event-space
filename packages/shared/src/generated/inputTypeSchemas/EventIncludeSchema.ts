import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const EventIncludeSchema: z.ZodType<Prisma.EventInclude> = z.object({
  organizer: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict();

export default EventIncludeSchema;
