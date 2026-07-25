import { z } from 'zod';

export const EventScalarFieldEnumSchema = z.enum(['id','locationUrl','meetingLocationUrl','difficulty','price','duration','status','createdAt','updatedAt','userId','categoryId']);

export default EventScalarFieldEnumSchema;
