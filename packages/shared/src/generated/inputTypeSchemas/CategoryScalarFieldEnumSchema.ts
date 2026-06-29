import { z } from 'zod';

export const CategoryScalarFieldEnumSchema = z.enum(['id','slug','createdAt','updatedAt']);

export default CategoryScalarFieldEnumSchema;
