import { z } from 'zod';

export const ChannelScalarFieldEnumSchema = z.enum(['id','code','name','nameKey','isSystem','isActive','forBookings','forReviews','createdAt','updatedAt']);

export default ChannelScalarFieldEnumSchema;
