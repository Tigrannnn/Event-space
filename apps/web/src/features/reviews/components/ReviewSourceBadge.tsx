'use client';

import { ExternalLink } from 'lucide-react';
import type { ReviewSource } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

/** Says where a review was written when it was not written here. Nothing for our own. */
export function ReviewSourceBadge({
	source,
	sourceName,
}: {
	source?: ReviewSource | null;
	sourceName?: string | null;
}) {
	const translate = useTranslation();

	if (!source || source === 'PLATFORM') return null;

	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
			<ExternalLink className="size-3" />
			{source === 'OTHER' && !sourceName
				? translate('review.writtenElsewhere')
				: translate('review.writtenIn', {
						source: source === 'OTHER' ? (sourceName ?? '') : translate(`review.source.${source}`),
					})}
		</span>
	);
}
