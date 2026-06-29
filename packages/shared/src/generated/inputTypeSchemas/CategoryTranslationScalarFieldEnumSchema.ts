import { z } from 'zod';

export const CategoryTranslationScalarFieldEnumSchema = z.enum(['id','categoryId','locale','name']);

export default CategoryTranslationScalarFieldEnumSchema;
