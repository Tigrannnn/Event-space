import { z } from 'zod';

export const EventScalarFieldEnumSchema = z.enum(['id','title','description','location','locationUrl','date','difficulty','price','maxParticipants','currentParticipants','category','whatsIncluded','duration','status','createdAt','updatedAt','userId']);

export default EventScalarFieldEnumSchema;
