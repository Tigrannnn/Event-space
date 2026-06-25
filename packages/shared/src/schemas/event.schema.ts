import { z } from './openapi';
import { EventSchema as GeneratedEventSchema } from '../generated/modelSchema/EventSchema';
import { EventStatusSchema } from '../generated/inputTypeSchemas/EventStatusSchema';
import { EventDifficultySchema } from '../generated/inputTypeSchemas/EventDifficultySchema';
import { TimeFilterSchema } from './common.schema';
import { SafeUserSchema } from './user.schema';
import {
	CancellationPolicyRuleInputSchema,
	CancellationPolicyRuleSchema,
} from './cancellation-policy-rule.schema';
import {
	EventTranslationSchema as GeneratedEventTranslationSchema,
	LocaleSchema,
} from '../generated';

export const EventStatusEnum = EventStatusSchema;
export type EventStatus = z.infer<typeof EventStatusEnum>;

export const EventDifficultyEnum = EventDifficultySchema;
export type EventDifficulty = z.infer<typeof EventDifficultyEnum>;

export const LocaleEnum = LocaleSchema;
export type Locale = z.infer<typeof LocaleEnum>;
export type LocaleIntlEnum = 'hy-AM' | 'ru-RU' | 'en-US';

export const EventTranslationSchema = GeneratedEventTranslationSchema.extend({});
export type EventTranslation = z.infer<typeof EventTranslationSchema>;

export const CreateEventTranslationSchema = EventTranslationSchema.omit({
    id: true,
    eventId: true,
});

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
	locationUrl: z.string().url().nullable().optional(),
	translations: z.array(EventTranslationSchema).default([]),
}).openapi({
	description: 'Event information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440000',
		date: new Date('2026-06-15T10:00:00Z'),
		difficulty: 'MODERATE',
		price: 50,
		maxParticipants: 100,
		duration: 180,
		status: EventStatusSchema.enum.DRAFT,
		userId: '550e8400-e29b-41d4-a716-446655440000',
		currentParticipants: 0,
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
                category: 'Hiking',
                whatsIncluded: ['Guide', 'Water', 'Snacks'],
            },
            {
                id: '220e8400-e29b-41d4-a716-446655440002',
                eventId: '550e8400-e29b-41d4-a716-446655440000',
                locale: 'ru',
                title: 'Горный поход',
                description: 'Живописный поход по горным тропам',
                location: 'Алматы, Казахстан',
                category: 'Поход',
                whatsIncluded: ['Гид', 'Вода', 'Закуски'],
            },
			{
                id: '220e8400-e29b-41d4-a716-446655440003',
                eventId: '550e8400-e29b-41d4-a716-446655440000',
                locale: 'hy',
                title: 'Գորշ անցում',
                description: 'Ոսկրագունդ գորշ անցում գորշ ճակատագրերով',
                location: 'Ալմատի, Ղազախստան',
                category: 'Անցում',
                whatsIncluded: ['Գիդ', 'Ջուր', 'Թեթև ուտեստներ'],
            }
        ]
	},
});

export type Event = z.infer<typeof EventSchema>;

// === QUERIES ===
export const EventFiltersSchema = z.object({
	skip: z.coerce.number().optional(),
	limit: z.coerce.number().optional(),
	search: z.string().optional(),
	status: EventStatusEnum.optional(),
	difficulty: EventDifficultyEnum.optional(),
	time: TimeFilterSchema.optional(),
});

export type EventFilters = z.infer<typeof EventFiltersSchema>;

// === CREATE EVENT ===
export const CreateEventSchema = EventSchema.omit({
	id: true,
	userId: true,
	currentParticipants: true,
	createdAt: true,
	updatedAt: true,
	images: true,
	translations: true,
}).extend({
	cancellationRules: z.array(CancellationPolicyRuleInputSchema).default([]),
	translations: z.array(CreateEventTranslationSchema).min(1, 'At least one translation is required'),
});

export type CreateEventData = z.infer<typeof CreateEventSchema>;

// === UPDATE EVENT ===
export const UpdateEventSchema = CreateEventSchema.partial().extend({
  cancellationReason: z.string().optional(),
});

export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
