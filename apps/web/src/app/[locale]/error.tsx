'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import PageState from '@/components/ui/PageState';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';


export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const navigation = useLocalizedNavigation();
	const translate = useTranslation();

	useEffect(() => {
		console.error('Global error:', error);
	}, [error]);

	return (
		<PageState
			icon={
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
					<AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
				</div>
			}
			title={translate('common.somethingWentWrong')}
			description={translate('common.unexpectedError')}
			actions={
				<>
					<Button onClick={reset}>
						<RefreshCcw className="h-4 w-4" />
						{translate('common.tryAgain')}
					</Button>

					<Button variant="secondary" onClick={() => navigation.push('/')}>
						<Home className="h-4 w-4" />
						{translate('common.goHome')}
					</Button>
				</>
			}
		>
			{error.digest && (
				<p className="mt-8 text-xs text-gray-400 dark:text-gray-500">Error ID: {error.digest}</p>
			)}
		</PageState>
	);
}
