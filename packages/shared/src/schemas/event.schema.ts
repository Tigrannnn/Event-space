import { z } from './openapi';
import { EventSchema as GeneratedEventSchema } from '../generated/modelSchema/EventSchema';
import { EventStatusSchema } from '../generated/inputTypeSchemas/EventStatusSchema';
import { EventDifficultySchema } from '../generated/inputTypeSchemas/EventDifficultySchema';
import { TimeFilterSchema } from './common.schema';
import { CancellationPolicyRuleSchema as GeneratedRuleSchema } from '../generated';

export const CancellationPolicyRuleInputSchema = GeneratedRuleSchema.omit({
	id: true,
	eventId: true,
});

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
	price: z.number().openapi({ example: 5000 }),
	images: z.array(EventImageSchema).optional(),
	cancellationRules: z.array(GeneratedRuleSchema).default([]),
}).openapi({
	description: 'Event information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440000',
		title: 'Mountain Hike',
		description: 'A scenic mountain trail hike with beautiful views',
		location: 'Almaty, Kazakhstan',
		date: new Date('2026-06-15T10:00:00Z'),
		difficulty: 'MODERATE',
		price: 5000,
		maxParticipants: 100,
		category: 'hiking',
		whatsIncluded: ['Guide', 'Water', 'Snacks'],
		duration: 180,
		status: EventStatusSchema.enum.DRAFT,
		userId: '550e8400-e29b-41d4-a716-446655440000',
		currentParticipants: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
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
}).extend({
	cancellationRules: z.array(CancellationPolicyRuleInputSchema).default([]),
});

export type CreateEventData = z.infer<typeof CreateEventSchema>;

// === UPDATE EVENT ===
export const UpdateEventSchema = CreateEventSchema.partial();

export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
