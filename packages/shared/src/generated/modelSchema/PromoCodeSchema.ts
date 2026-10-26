import { z } from 'zod';

/////////////////////////////////////////
// PROMO CODE SCHEMA
/////////////////////////////////////////

export const PromoCodeSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  discountPercent: z.number().int(),
  maxUses: z.number().int().nullable(),
  maxUsesPerUser: z.number().int().nullable(),
  usageCount: z.number().int(),
  validFrom: z.coerce.date().nullable(),
  validUntil: z.coerce.date().nullable(),
  active: z.boolean(),
  note: z.string().nullable(),
  eventId: z.string().nullable(),
  categoryId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PromoCode = z.infer<typeof PromoCodeSchema>

export default PromoCodeSchema;
