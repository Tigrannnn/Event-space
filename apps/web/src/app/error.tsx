'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Buttons';

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
		<div className="flex min-h-[80vh] items-center justify-center px-4">
			<div className="w-full max-w-md text-center">
				{/* Icon */}
				<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
					<AlertTriangle className="h-10 w-10 text-red-500 dark:text-red-400" />
				</div>

				{/* Title */}
				<h1 className="text-primary mb-2 text-2xl font-black">Something Went Wrong</h1>
				<p className="mb-8 text-gray-500 dark:text-gray-400">
					We encountered an unexpected error. Please try again or go back home.
				</p>

				{/* Actions */}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
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
				</div>

				{/* Error digest for debugging */}
				{error.digest && (
					<p className="mt-8 text-xs text-gray-400 dark:text-gray-500">Error ID: {error.digest}</p>
				)}
			</div>
		</div>
	);
}
