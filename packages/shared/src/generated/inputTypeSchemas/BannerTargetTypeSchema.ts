import { z } from 'zod';

export const BannerTargetTypeSchema = z.enum(['EVENT','CATEGORY','URL']);

export type BannerTargetTypeType = `${z.infer<typeof BannerTargetTypeSchema>}`

export default BannerTargetTypeSchema;
