import { z } from 'zod';

export const SearchQueryScalarFieldEnumSchema = z.enum(['id','userId','query','normalized','hidden','createdAt']);

export default SearchQueryScalarFieldEnumSchema;
