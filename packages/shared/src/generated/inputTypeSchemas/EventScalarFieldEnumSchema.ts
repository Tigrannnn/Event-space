import { z } from 'zod';

export const EventScalarFieldEnumSchema = z.enum(['id','locationUrl','difficulty','price','duration','status','createdAt','updatedAt','userId','categoryId']);

export default EventScalarFieldEnumSchema;
