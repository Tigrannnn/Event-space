import { z } from 'zod';

export const ReviewSourceSchema = z.enum(['PLATFORM','GETYOURGUIDE','TRIPADVISOR','VIATOR','GOOGLE','INSTAGRAM','FACEBOOK','OTHER']);

export type ReviewSourceType = `${z.infer<typeof ReviewSourceSchema>}`

export default ReviewSourceSchema;
