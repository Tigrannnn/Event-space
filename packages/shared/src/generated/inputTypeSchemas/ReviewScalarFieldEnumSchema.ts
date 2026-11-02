import { z } from 'zod';

export const ReviewScalarFieldEnumSchema = z.enum(['id','bookingId','eventId','userId','source','authorName','sourceName','rating','text','status','moderatedAt','moderatedByAdminId','rejectReason','adminReply','adminReplyAt','createdAt','updatedAt']);

export default ReviewScalarFieldEnumSchema;
