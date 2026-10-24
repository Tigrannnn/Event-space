import { z } from 'zod';

export const BannerScalarFieldEnumSchema = z.enum(['id','imageUrl','imagePublicId','imageMobileUrl','imageMobilePublicId','status','sortOrder','startsAt','endsAt','targetType','eventId','categoryId','url','textAlign','theme','createdAt','updatedAt']);

export default BannerScalarFieldEnumSchema;
