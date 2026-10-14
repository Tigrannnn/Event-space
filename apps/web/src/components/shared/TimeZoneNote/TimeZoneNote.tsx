'use client';

import { Clock } from 'lucide-react';
import { APP_TIME_ZONE, formatZoneOffset } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

interface TimeZoneNoteProps {
	className?: string;
	messageKey?: 'common.timesInZone' | 'admin.timeZoneHint';
}

export default function TimeZoneNote({
	className = '',
	messageKey = 'common.timesInZone',
}: TimeZoneNoteProps) {
	const translate = useTranslation();
	const offset = formatZoneOffset(new Date(), APP_TIME_ZONE);

	return (
		<p className={`flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
			<Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
			{translate(messageKey, { offset })}
		</p>
	);
}
