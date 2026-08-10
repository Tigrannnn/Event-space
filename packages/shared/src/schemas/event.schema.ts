import { z } from './openapi';
import { EventSchema as GeneratedEventSchema } from '../generated/modelSchema/EventSchema';
import { EventStatusSchema } from '../generated/inputTypeSchemas/EventStatusSchema';
import { EventDifficultySchema } from '../generated/inputTypeSchemas/EventDifficultySchema';
import { SpotsFilterSchema, TimeFilterSchema } from './common.schema';
import { SafeUserSchema } from './user.schema';
import {
	CancellationPolicyRuleInputSchema,
	CancellationPolicyRuleSchema,
} from './cancellation-policy-rule.schema';
import { CategorySchema } from './category.schema';
import { CreateEventTranslationSchema, EventTranslationSchema } from './event-translation.schema';
import {
	BookingStatusCountsSchema,
	CreateEventOccurrenceSchema,
	EventOccurrenceSchema,
	UpdateEventOccurrenceSchema,
} from './event-occurrence.schema';

export const EventStatusEnum = EventStatusSchema;
export type EventStatus = z.infer<typeof EventStatusEnum>;

export const EventDifficultyEnum = EventDifficultySchema;
export type EventDifficulty = z.infer<typeof EventDifficultyEnum>;

export const EventImageSchema = z.object({
	id: z.string().uuid(),
	url: z.string(),
	publicId: z.string(),
	order: z.number().int(),
});

export type EventImage = z.infer<typeof EventImageSchema>;

export const EventSchema = GeneratedEventSchema.extend({
	price: z.number(),
	images: z.array(EventImageSchema).optional(),
	organizer: SafeUserSchema.optional(),
	cancellationRules: z.array(CancellationPolicyRuleSchema).default([]),
	translations: z.array(EventTranslationSchema).default([]),
	category: CategorySchema,
	occurrences: z.array(EventOccurrenceSchema),
	/** Bookings across every occurrence of this event, by status. */
	bookingStats: BookingStatusCountsSchema.optional(),
}).openapi({
	description: 'Event information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440000',
		difficulty: 'MODERATE',
		price: 50,
		duration: 180,
		status: EventStatusSchema.enum.DRAFT,
		userId: '550e8400-e29b-41d4-a716-446655440000',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		translations: [
			{
				id: '110e8400-e29b-41d4-a716-446655440001',
				eventId: '550e8400-e29b-41d4-a716-446655440000',
				locale: 'en',
				title: 'Mountain Hike',
				description: 'A scenic mountain trail hike with beautiful views',
				location: 'Almaty, Kazakhstan',
				whatsIncluded: ['Guide', 'Water', 'Snacks'],
			},
			{
				id: '220e8400-e29b-41d4-a716-446655440002',
				eventId: '550e8400-e29b-41d4-a716-446655440000',
				locale: 'ru',
				title: 'Горный поход',
				description: 'Живописный поход по горным тропам',
				location: 'Алматы, Казахстан',
				whatsIncluded: ['Гид', 'Вода', 'Закуски'],
			},
			{
				id: '220e8400-e29b-41d4-a716-446655440003',
				eventId: '550e8400-e29b-41d4-a716-446655440000',
				locale: 'hy',
				title: 'Գորշ անցում',
				description: 'Ոսկրագունդ գորշ անցում գորշ ճակատագրերով',
				location: 'Ալմատի, Ղազախստան',
				whatsIncluded: ['Գիդ', 'Ջուր', 'Թեթև ուտեստներ'],
			},
		],
		occurrences: [
			{
				id: '330e8400-e29b-41d4-a716-446655440004',
				eventId: '550e8400-e29b-41d4-a716-446655440000',
				date: new Date('2026-06-15T10:00:00Z'),
				maxParticipants: 100,
				currentParticipants: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		],
	},
});

export type Event = z.infer<typeof EventSchema>;

export const EventWithFavoriteStatusSchema = EventSchema.extend({
	isFavorited: z.boolean().default(false),
});

export type EventWithFavoriteStatus = z.infer<typeof EventWithFavoriteStatusSchema>;

// === QUERIES ===
export const EventFiltersSchema = z.object({
	skip: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	search: z.string().optional(),
	status: EventStatusEnum.optional(),
	difficulty: EventDifficultyEnum.optional(),
	time: TimeFilterSchema.optional(),
	category: z.string().optional(),
	minPrice: z.coerce.number().optional(),
	maxPrice: z.coerce.number().optional(),
	/** `YYYY-MM-DD`, inclusive on both ends. Matches an event by the date of its occurrences. */
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	spots: SpotsFilterSchema.optional(),
});

export type EventFilters = z.infer<typeof EventFiltersSchema>;

// === CREATE EVENT ===
export const CreateEventSchema = EventSchema.omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
	images: true,
	translations: true,
	category: true,
	occurrences: true,
}).extend({
	cancellationRules: z.array(CancellationPolicyRuleInputSchema).default([]),
	translations: z.array(CreateEventTranslationSchema).min(1, 'At least one translation is required'),
	categoryId: z.string().uuid(),
	occurrences: z.array(CreateEventOccurrenceSchema).min(1, 'At least one occurrence is required'),
});

export type CreateEventData = z.infer<typeof CreateEventSchema>;

// === UPDATE EVENT ===
export const UpdateEventSchema = CreateEventSchema.partial().extend({
	cancellationReason: z.string().optional(),
	occurrences: z.array(UpdateEventOccurrenceSchema).optional(),
});

export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
