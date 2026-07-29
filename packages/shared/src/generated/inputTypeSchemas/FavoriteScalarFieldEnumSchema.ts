import { z } from 'zod';

export const FavoriteScalarFieldEnumSchema = z.enum(['id','userId','eventId','createdAt']);

export default FavoriteScalarFieldEnumSchema;
