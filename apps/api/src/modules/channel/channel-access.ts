import type { Prisma } from '@prisma/client';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '@shared';

export type ChannelUse = 'bookings' | 'reviews';

/** A channel may take new bookings or reviews only while it is active and meant for them. */
export async function requireChannelFor(
	db: { channel: Prisma.TransactionClient['channel'] },
	channelId: string,
	use: ChannelUse,
) {
	const channel = await db.channel.findUnique({ where: { id: channelId } });
	if (!channel) throw new AppException(AppErrorCode.CHANNEL_NOT_FOUND);

	const meantFor = use === 'bookings' ? channel.forBookings : channel.forReviews;
	if (!channel.isActive || !meantFor) throw new AppException(AppErrorCode.CHANNEL_NOT_AVAILABLE);

	return channel;
}
