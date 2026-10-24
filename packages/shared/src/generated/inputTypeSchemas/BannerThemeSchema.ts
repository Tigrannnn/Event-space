import { z } from 'zod';

export const BannerThemeSchema = z.enum(['LIGHT','DARK']);

export type BannerThemeType = `${z.infer<typeof BannerThemeSchema>}`

export default BannerThemeSchema;
