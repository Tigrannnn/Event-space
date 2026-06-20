'use client';

import Button from '@/components/ui/Buttons';
import { Home } from 'lucide-react';
import PageState from '@/components/ui/PageState';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';

export default function NotFound() {
	const translate = useTranslation();
	const navigation = useLocalizedNavigation();

	return (
		<PageState className="from-primary/10 to-accent/10 bg-linear-to-br">
			<div className="max-w-md text-center">
				<h1 className="text-primary text-[120px] leading-none font-black sm:text-[150px] md:text-[180px]">
					404
				</h1>
				<h2 className="mb-4 text-2xl font-bold text-gray-800 sm:text-3xl dark:text-gray-200">
					{translate('common.notFoundTitle')}
				</h2>
				<p className="mb-8 text-base text-gray-600 sm:text-lg dark:text-gray-400">
					{translate('common.notFoundDescription')}
				</p>
				<Button className="w-full" onClick={() => navigation.push('/')}>
					<Home className="h-5 w-5" />
					{translate('common.goHome')}
				</Button>
			</div>
		</PageState>
	);
}
