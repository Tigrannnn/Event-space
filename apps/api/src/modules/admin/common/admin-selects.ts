import { CHANNEL_REF } from '@modules/channel/channel-ref.select';

export const safeUserSelect = {
	id: true,
	email: true,
	name: true,
	phone: true,
	image: true,
	role: true,
	emailVerified: true,
	isShadow: true,
	locale: true,
	createdAt: true,
	updatedAt: true,
};

export const bookingInclude = {
	channel: CHANNEL_REF,
	user: {
		select: safeUserSelect,
	},
	occurrence: {
		include: {
			event: {
				include: {
					images: true,
					cancellationRules: true,
					translations: true,
					category: { include: { translations: true } },
					occurrences: {
						include: {
							_count: {
								select: {
									bookings: true,
								},
							},
						},
					},
				},
			},
		},
	},
	adjustments: true,
} as const;
