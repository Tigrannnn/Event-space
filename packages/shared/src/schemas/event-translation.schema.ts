import { EventTranslationSchema as GeneratedEventTranslationSchema } from "../generated";

export const EventTranslationSchema = GeneratedEventTranslationSchema;
export const CreateEventTranslationSchema = EventTranslationSchema.omit({
    id: true,
    eventId: true,
});