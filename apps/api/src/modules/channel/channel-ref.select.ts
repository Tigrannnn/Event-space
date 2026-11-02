import type { Prisma } from '@prisma/client';

/** What a booking or a review shows of its channel: enough for a label. */
export const CHANNEL_REF = {
	select: { id: true, code: true, name: true, isSystem: true },
} satisfies Prisma.ChannelDefaultArgs;
