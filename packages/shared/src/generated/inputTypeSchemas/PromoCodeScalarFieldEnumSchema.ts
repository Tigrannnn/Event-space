import { z } from 'zod';

export const PromoCodeScalarFieldEnumSchema = z.enum(['id','code','discountPercent','maxUses','maxUsesPerUser','usageCount','validFrom','validUntil','active','note','eventId','categoryId','createdAt','updatedAt']);

export default PromoCodeScalarFieldEnumSchema;
