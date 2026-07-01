import { z } from 'zod';

export const EventOccurrenceScalarFieldEnumSchema = z.enum(['id','eventId','date','maxParticipants','currentParticipants','createdAt','updatedAt']);

export default EventOccurrenceScalarFieldEnumSchema;
