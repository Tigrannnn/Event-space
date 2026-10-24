import { z } from 'zod';

export const BannerStatusSchema = z.enum(['DRAFT','ACTIVE']);

export type BannerStatusType = `${z.infer<typeof BannerStatusSchema>}`

export default BannerStatusSchema;
