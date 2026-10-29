'use client';

import { ArrowLeft, Compass, Home } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import PageState from '@/components/ui/PageState';
import { useTranslation } from '@/hooks/translation';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useSkin } from '@/providers/BrandProvider';

/**
 * Each skin gets its own 404: a centred plate with the number on it for the classic one, a quiet
 * left-aligned message for minimal, and a boxed notice with two ways out for listing.
 */
export default function NotFound() {
	const translate = useTranslation();
	const navigation = useLocalizedNavigation();
	const skin = useSkin();

	if (skin === 'minimal') {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center px-6 py-16">
				<p className="text-sm font-semibold text-gray-500 dark:text-gray-400">404</p>
				<h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
					{translate('common.notFoundTitle')}
				</h1>
				<p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
					{translate('common.notFoundDescription')}
				</p>
				<div className="mt-8">
					<Button onClick={() => navigation.push('/')}>{translate('common.goHome')}</Button>
				</div>
			</div>
		);
	}

	if (skin === 'soft') {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-12">
				<div className="w-full rounded-[2rem] border-2 border-dashed border-gray-300 bg-white p-8 text-center sm:p-12 dark:border-gray-600 dark:bg-gray-800">
					<p className="font-(family-name:--font-display) text-primary text-7xl leading-none font-bold sm:text-8xl">
						404
					</p>
					<h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
						{translate('common.notFoundTitle')}
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						{translate('common.notFoundDescription')}
					</p>
					<Button className="mt-7 px-8" onClick={() => navigation.push('/')}>
						<Home className="size-4" />
						{translate('common.goHome')}
					</Button>
				</div>
			</div>
		);
	}

	if (skin === 'market' || skin === 'drawer') {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-12">
				<div className="bg-primary/10 w-full rounded-3xl p-8 text-center sm:p-12">
					<p className="text-primary text-7xl leading-none font-black sm:text-8xl">404</p>
					<h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
						{translate('common.notFoundTitle')}
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						{translate('common.notFoundDescription')}
					</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button className="px-6 py-2.5" onClick={() => navigation.push('/')}>
							<Home className="size-4" />
							{translate('common.goHome')}
						</Button>
						<Button variant="secondary" className="px-6 py-2.5" onClick={() => history.back()}>
							<ArrowLeft className="size-4" />
							{translate('event.back')}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (skin === 'listing') {
		return (
			<div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-4 py-12">
				<div className="w-full rounded-lg border border-gray-200 bg-white p-6 text-center sm:p-10 dark:border-neutral-800 dark:bg-neutral-900">
					<span className="bg-primary/10 text-primary mx-auto flex size-16 items-center justify-center rounded-lg">
						<Compass className="size-8" />
					</span>
					<h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
						{translate('common.notFoundTitle')}
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						{translate('common.notFoundDescription')}
					</p>
					<p className="text-primary mt-4 text-sm font-semibold">404</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button className="px-6 py-2.5" onClick={() => navigation.push('/')}>
							<Home className="size-4" />
							{translate('common.goHome')}
						</Button>
						<Button variant="secondary" className="px-6 py-2.5" onClick={() => history.back()}>
							<ArrowLeft className="size-4" />
							{translate('event.back')}
						</Button>
					</div>
				</div>
			</div>
		);
	}

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
