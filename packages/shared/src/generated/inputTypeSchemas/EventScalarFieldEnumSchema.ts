import { z } from 'zod';

export const EventScalarFieldEnumSchema = z.enum(['id','locationUrl','date','difficulty','price','maxParticipants','currentParticipants','duration','status','createdAt','updatedAt','userId','categoryId']);

export default EventScalarFieldEnumSchema;
