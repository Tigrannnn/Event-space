'use client';

import type { SourceRef } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

interface SourceOf {
	source?: SourceRef | null;
	sourceRef?: string | null;
}

export function useSourceLabel() {
	const translate = useTranslation();

	return ({ source, sourceRef }: SourceOf) => {
		if (source) return source.name;
		if (sourceRef) return translate('admin.sourceUnknownRef', { ref: sourceRef });
		return translate('admin.sourceUnspecified');
	};
}
