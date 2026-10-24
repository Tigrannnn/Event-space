import { z } from 'zod';

export const BannerTranslationScalarFieldEnumSchema = z.enum(['id','bannerId','locale','title','subtitle']);

export default BannerTranslationScalarFieldEnumSchema;
