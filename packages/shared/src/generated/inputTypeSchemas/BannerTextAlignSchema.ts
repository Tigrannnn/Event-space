import { z } from 'zod';

export const BannerTextAlignSchema = z.enum(['LEFT','CENTER','RIGHT']);

export type BannerTextAlignType = `${z.infer<typeof BannerTextAlignSchema>}`

export default BannerTextAlignSchema;
