'use client';

import { PLATFORM_CODES, type Source } from '@event-space/shared';
import { useAdminSources } from '@/features/admin/hooks/useAdmin';
import { useSourceLabel } from '@/hooks/labels/useSourceLabel';

function platformOrder(source: Source) {
	const index = (PLATFORM_CODES as readonly string[]).indexOf(source.code);
	return index === -1 ? PLATFORM_CODES.length : index;
}

export function useSourceOptions({ includeArchived = false } = {}) {
	const sourceLabel = useSourceLabel();
	const { data = [] } = useAdminSources({ includeArchived, withPlatforms: true });

	const platforms = data.filter((source) => source.kind === 'PLATFORM').sort((a, b) => platformOrder(a) - platformOrder(b));
	const partners = data.filter((source) => source.kind === 'PARTNER');

	return [...partners, ...platforms].map((source) => ({ value: source.id, label: sourceLabel({ source }) }));
}
