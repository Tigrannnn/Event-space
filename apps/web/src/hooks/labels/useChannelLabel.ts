'use client';

import type { ChannelRef } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

type SystemChannelCode = 'SITE' | 'UNSPECIFIED';

/** The name a channel is shown under: ours are translated, the rest are names of other companies. */
export function useChannelLabel() {
	const translate = useTranslation();

	return (channel: Pick<ChannelRef, 'code' | 'name' | 'isSystem'>) =>
		channel.isSystem ? translate(`admin.channel.${channel.code as SystemChannelCode}`) : channel.name;
}
