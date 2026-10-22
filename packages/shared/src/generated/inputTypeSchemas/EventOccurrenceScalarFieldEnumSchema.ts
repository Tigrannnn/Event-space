import { z } from 'zod';

export const EventOccurrenceScalarFieldEnumSchema = z.enum(['id','eventId','date','status','maxParticipants','currentParticipants','createdAt','updatedAt','cancelledAt','previousDate','rescheduledAt','cancelReasonRu','cancelReasonEn','cancelReasonHy']);

export default EventOccurrenceScalarFieldEnumSchema;
