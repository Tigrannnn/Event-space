import { z } from 'zod';
import { LocaleSchema } from '../inputTypeSchemas/LocaleSchema'

/////////////////////////////////////////
// EVENT TRANSLATION SCHEMA
/////////////////////////////////////////

export const EventTranslationSchema = z.object({
  locale: LocaleSchema,
  id: z.string().uuid(),
  eventId: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  whatsIncluded: z.string().array(),
})

export type EventTranslation = z.infer<typeof EventTranslationSchema>

export default EventTranslationSchema;
