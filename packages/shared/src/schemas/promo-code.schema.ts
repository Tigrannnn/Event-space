import { z } from './openapi';
import { PromoCodeSchema as GeneratedPromoCodeSchema } from '../generated/modelSchema/PromoCodeSchema';

export const PromoCodeSchema = GeneratedPromoCodeSchema;
export type PromoCode = z.infer<typeof PromoCodeSchema>;

// Written out explicitly rather than derived from the generated model schema, so the
// nullability of optional fields in the request body is under our control, not whatever
// the Prisma-to-zod generator happens to produce for a nullable column.
export const CreatePromoCodeSchema = z.object({
	code: z
		.string()
		.trim()
		.min(3)
		.max(40)
		.transform((value) => value.toUpperCase())
		.openapi({ description: 'Code the customer types in', example: 'SUMMER10' }),
	discountPercent: z.number().int().min(1).max(100).openapi({ example: 10 }),
	maxUses: z.number().int().positive().nullish().openapi({
		description: 'Total number of bookings this code can be used on; unlimited if omitted',
	}),
	maxUsesPerUser: z.number().int().positive().nullish().openapi({
		description: 'How many times one customer can use this code; unlimited if omitted',
	}),
	validFrom: z.coerce.date().nullish(),
	validUntil: z.coerce.date().nullish(),
	active: z.boolean().default(true),
	eventId: z.string().uuid().nullish().openapi({
		description: 'Restrict the code to one tour; applies to every tour if omitted',
	}),
	categoryId: z.string().uuid().nullish().openapi({
		description: 'Restrict the code to one category; applies to every category if omitted',
	}),
	note: z.string().trim().max(500).nullish().openapi({
		description: 'Admin-only note, e.g. who the code was given to and why',
	}),
});

export type CreatePromoCodeData = z.infer<typeof CreatePromoCodeSchema>;

export const UpdatePromoCodeSchema = CreatePromoCodeSchema.partial();
export type UpdatePromoCodeData = z.infer<typeof UpdatePromoCodeSchema>;

export const ApplyPromoCodeSchema = z.object({
	code: z.string().trim().min(1),
	occurrenceId: z.string().uuid(),
	quantity: z.number().int().min(1).default(1),
});

export type ApplyPromoCodeData = z.infer<typeof ApplyPromoCodeSchema>;

export const PromoCodeQuoteSchema = z.object({
	promoCodeId: z.string(),
	code: z.string(),
	/** The percent actually applied — the better of the code and the tour's own discount. */
	discountPercent: z.number(),
	/** What the code itself is worth, so the UI can explain when the tour's discount won instead. */
	promoCodeDiscountPercent: z.number(),
	baseAmount: z.number(),
	amount: z.number(),
});

export type PromoCodeQuote = z.infer<typeof PromoCodeQuoteSchema>;
