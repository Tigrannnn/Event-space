import { z } from 'zod';

export const ReviewScalarFieldEnumSchema = z.enum(['id','bookingId','eventId','userId','rating','text','status','moderatedAt','moderatedByAdminId','rejectReason','adminReply','adminReplyAt','createdAt','updatedAt']);

export default ReviewScalarFieldEnumSchema;
