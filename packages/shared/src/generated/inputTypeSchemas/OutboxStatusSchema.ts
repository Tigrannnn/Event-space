import { z } from 'zod';

export const OutboxStatusSchema = z.enum(['PENDING','DONE','FAILED']);

export type OutboxStatusType = `${z.infer<typeof OutboxStatusSchema>}`

export default OutboxStatusSchema;
