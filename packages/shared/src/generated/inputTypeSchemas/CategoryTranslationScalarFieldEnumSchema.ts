import { z } from 'zod';

export const CategoryTranslationScalarFieldEnumSchema = z.enum(['id','categoryId','locale','name','description']);

export default CategoryTranslationScalarFieldEnumSchema;
