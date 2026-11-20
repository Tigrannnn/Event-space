import { CHANNEL_REF } from '@modules/channel/channel-ref.select';
import { SOURCE_REF } from '@modules/source/source-ref.select';

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

export const adminUserSelect = {
	...safeUserSelect,
	source: SOURCE_REF,
	_count: { select: { bookings: true } },
};

export function toAdminUser<T extends { _count: { bookings: number } }>({ _count, ...user }: T) {
	return { ...user, bookingsCount: _count.bookings };
}

export const bookingInclude = {
	channel: CHANNEL_REF,
	source: SOURCE_REF,
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
