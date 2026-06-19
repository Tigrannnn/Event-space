'use client';

import { useI18nStore } from '@/stores/i18n';
import PageState from '@/components/ui/PageState';

export default function HomeError() {
	const { translate } = useI18nStore();

	return (
		<PageState>
			<div className="rounded-2xl border border-red-100 p-6 text-center sm:rounded-[2.5rem] sm:p-10">
				<p className="mb-2 text-lg font-black uppercase text-red-600 sm:text-xl">{translate('error.errorLoadingEvents')}</p>
				<p className="text-[15px] text-red-400 sm:text-sm">{translate('error.checkConnection')}</p>
			</div>
		</PageState>
	);
}
