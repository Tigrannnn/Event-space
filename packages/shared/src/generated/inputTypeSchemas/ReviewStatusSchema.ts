import { z } from 'zod';

export const ReviewStatusSchema = z.enum(['PENDING','PUBLISHED','REJECTED']);

export type ReviewStatusType = `${z.infer<typeof ReviewStatusSchema>}`

export default ReviewStatusSchema;
