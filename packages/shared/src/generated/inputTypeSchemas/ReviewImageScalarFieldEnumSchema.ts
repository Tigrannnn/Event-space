import { z } from 'zod';

export const ReviewImageScalarFieldEnumSchema = z.enum(['id','reviewId','url','publicId','order','createdAt']);

export default ReviewImageScalarFieldEnumSchema;
