import { z } from 'zod';

export const EventTranslationScalarFieldEnumSchema = z.enum(['id','eventId','locale','title','description','location','category','whatsIncluded']);

export default EventTranslationScalarFieldEnumSchema;
