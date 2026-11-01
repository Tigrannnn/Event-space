import { z } from 'zod';

export const EventScalarFieldEnumSchema = z.enum(['id','locationUrl','meetingLocationUrl','videoUrl','difficulty','price','duration','status','ratingSum','ratingCount','createdAt','updatedAt','userId','categoryId']);

export default EventScalarFieldEnumSchema;
