import { z } from 'zod';

export const EventImageScalarFieldEnumSchema = z.enum(['id','eventId','url','publicId','order','createdAt','updatedAt']);

export default EventImageScalarFieldEnumSchema;
