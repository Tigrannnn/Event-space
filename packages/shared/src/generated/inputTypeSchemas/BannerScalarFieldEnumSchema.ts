import { z } from 'zod';

export const BannerScalarFieldEnumSchema = z.enum(['id','imageUrl','imagePublicId','status','sortOrder','startsAt','endsAt','targetType','eventId','categoryId','url','textAlign','theme','createdAt','updatedAt']);

export default BannerScalarFieldEnumSchema;
