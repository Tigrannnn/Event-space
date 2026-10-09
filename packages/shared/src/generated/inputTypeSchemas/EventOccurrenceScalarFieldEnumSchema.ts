import { z } from 'zod';

export const EventOccurrenceScalarFieldEnumSchema = z.enum(['id','eventId','date','status','maxParticipants','currentParticipants','createdAt','updatedAt','cancelledAt','cancelReasonRu','cancelReasonEn','cancelReasonHy']);

export default EventOccurrenceScalarFieldEnumSchema;
