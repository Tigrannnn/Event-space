import { z } from 'zod';

export const AdjustmentTypeSchema = z.enum(['CHARGE','REFUND']);

export type AdjustmentTypeType = `${z.infer<typeof AdjustmentTypeSchema>}`

export default AdjustmentTypeSchema;
