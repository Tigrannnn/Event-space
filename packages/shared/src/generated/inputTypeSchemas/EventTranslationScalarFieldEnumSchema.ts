import { z } from 'zod';

export const EventTranslationScalarFieldEnumSchema = z.enum(['id','eventId','locale','title','description','location','meetingLocation','whatsIncluded']);

export default EventTranslationScalarFieldEnumSchema;
