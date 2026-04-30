import { z } from './openapi';
import { EventSchema as GeneratedEventSchema } from '../generated/modelSchema/EventSchema';
import { EventStatusSchema } from '../generated/inputTypeSchemas/EventStatusSchema';

export const EventSchema = GeneratedEventSchema.extend({
	price: z.number().openapi({ example: 5000 }),
}).openapi({
	description: 'Event information',
	example: {
		id: '550e8400-e29b-41d4-a716-446655440000',
		title: 'Mountain Hike',
		description: 'A scenic mountain trail hike with beautiful views',
		images: ['https://example.com/image1.jpg'],
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

// === CREATE EVENT ===
export const CreateEventSchema = EventSchema.omit({
	id: true,
	userId: true,
	currentParticipants: true,
	createdAt: true,
	updatedAt: true,
});

export type CreateEventData = z.infer<typeof CreateEventSchema>;

// === UPDATE EVENT ===
export const UpdateEventSchema = CreateEventSchema.partial();

export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
