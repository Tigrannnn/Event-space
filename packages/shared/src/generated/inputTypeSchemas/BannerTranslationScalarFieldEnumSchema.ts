import { z } from 'zod';

export const BannerTranslationScalarFieldEnumSchema = z.enum(['id','bannerId','locale','title','subtitle','ctaLabel']);

export default BannerTranslationScalarFieldEnumSchema;
