'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Buttons';
import PageState from '@/components/ui/PageState';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
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
			title="Something Went Wrong"
			description="We encountered an unexpected error. Please try again or go back home."
			actions={
				<>
					<Button onClick={reset}>
						<RefreshCcw className="h-4 w-4" />
						Try Again
					</Button>

					<Link href="/">
						<Button variant="secondary">
							<Home className="h-4 w-4" />
							Go Home
						</Button>
					</Link>
				</>
			}
		>
			{error.digest && (
				<p className="mt-8 text-xs text-gray-400 dark:text-gray-500">Error ID: {error.digest}</p>
			)}
		</PageState>
	);
}
