import { z } from './openapi';
import { ChannelSchema as GeneratedChannelSchema } from '../generated/modelSchema/ChannelSchema';

export const CHANNEL_NAME_MAX = 80;

/** The two channels the code relies on; they exist in every database and cannot be removed. */
export const SYSTEM_CHANNEL_IDS = {
	DIRECT: '00000000-0000-4000-8000-000000000001',
	PLATFORM: '00000000-0000-4000-8000-000000000002',
} as const;

export const ChannelSchema = GeneratedChannelSchema.extend({
	id: z.string(),
});

export type Channel = z.infer<typeof ChannelSchema>;

/** What a booking or a review carries about its channel: enough to label it. */
export const ChannelRefSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	isSystem: z.boolean().optional(),
});

export type ChannelRef = z.infer<typeof ChannelRefSchema>;

export const ChannelWithUsageSchema = ChannelSchema.extend({
	bookingsCount: z.number().int(),
	reviewsCount: z.number().int(),
});

export type ChannelWithUsage = z.infer<typeof ChannelWithUsageSchema>;

/** The key two names are compared by: "Klook", " klook " and "KLOOK" are one channel. */
export function channelNameKey(name: string): string {
	return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

const ChannelNameSchema = z.string().trim().min(1).max(CHANNEL_NAME_MAX);

export const CreateChannelSchema = z
	.object({
		name: ChannelNameSchema,
		forBookings: z.boolean().default(false),
		forReviews: z.boolean().default(false),
	})
	.refine((data) => data.forBookings || data.forReviews, {
		path: ['forBookings'],
		message: 'A channel has to be used for bookings, for reviews, or for both',
	})
	.openapi({ description: 'A new place bookings are sold on or reviews are written on' });

export type CreateChannelData = z.infer<typeof CreateChannelSchema>;

export const UpdateChannelSchema = z
	.object({
		name: ChannelNameSchema,
		isActive: z.boolean(),
		forBookings: z.boolean(),
		forReviews: z.boolean(),
	})
	.partial()
	.openapi({ description: 'Rename, archive or restore a channel, or change what it is used for' });

export type UpdateChannelData = z.infer<typeof UpdateChannelSchema>;
