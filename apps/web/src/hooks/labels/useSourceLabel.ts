'use client';

import { isPlatformCode, type SourceRef } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export function useSourceLabel() {
	const translate = useTranslation();

	return ({ source }: { source?: Pick<SourceRef, 'code' | 'name' | 'kind'> | null }) => {
		if (!source) return translate('admin.sourceUnspecified');
		if (source.kind === 'PLATFORM' && isPlatformCode(source.code)) {
			return translate(`admin.platform.${source.code}`);
		}
		return source.name;
	};
}
