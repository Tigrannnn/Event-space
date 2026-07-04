import z from "zod";
import { EventOccurrenceSchema as GeneratedEventOccurrenceSchema } from "../generated";

export const CreateEventOccurrenceSchema = z.object({
    date: z.coerce.date(),
    maxParticipants: z.number().int().min(1).optional(),
});

export const EventOccurrenceSchema = GeneratedEventOccurrenceSchema.extend({
    maxParticipants: z.number().int(),
    currentParticipants: z.number().int(),
});

export type EventOccurrence = z.infer<typeof EventOccurrenceSchema>;