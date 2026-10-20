import { z } from 'zod';

export const ModificationStatusSchema = z.enum(['PENDING_PAYMENT','APPLIED','CANCELLED','EXPIRED','FAILED']);

export type ModificationStatusType = `${z.infer<typeof ModificationStatusSchema>}`

export default ModificationStatusSchema;
