import { z } from 'zod';

export const AdjustmentStatusSchema = z.enum(['PENDING','SUCCEEDED','FAILED']);

export type AdjustmentStatusType = `${z.infer<typeof AdjustmentStatusSchema>}`

export default AdjustmentStatusSchema;
