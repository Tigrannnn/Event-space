'use client';

import { useTranslation } from '@/hooks/translation';
import { useBrand, useSkin } from '@/providers/BrandProvider';
import { messages } from '@/lib/i18n/messages';

interface LegalPageContentProps {
	document: 'privacy' | 'terms';
}

export default function LegalPageContent({ document }: LegalPageContentProps) {
	const translate = useTranslation();
	const brand = useBrand();
	const skin = useSkin();
	const content = messages[translate.locale].legal[document];
	const withCompany = (text: string) => text.replaceAll('{company}', brand.name);

	const contact = brand.contact.email && (
		<>
			{translate('legal.questions')}{' '}
			<a href={`mailto:${brand.contact.email}`} className="text-primary hover:underline">
				{brand.contact.email}
			</a>
		</>
	);

	if (skin === 'minimal') {
		return (
			<div className="min-h-full px-4 py-10 sm:py-16">
				<div className="mx-auto max-w-2xl">
					<h1 className="text-4xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
						{content.title}
					</h1>
					<p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{translate('legal.updated')}</p>
					<p className="mt-8 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
						{withCompany(content.intro)}
					</p>

					<div className="mt-10 divide-y divide-gray-200 border-t border-gray-200 dark:divide-neutral-800 dark:border-neutral-800">
						{content.sections.map((section) => (
							<section key={section.title} className="py-8">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{section.title}</h2>
								<div className="mt-3 flex flex-col gap-3">
									{section.body.map((paragraph) => (
										<p key={paragraph} className="leading-relaxed text-gray-600 dark:text-gray-300">
											{withCompany(paragraph)}
										</p>
									))}
								</div>
							</section>
						))}
					</div>

					{contact && (
						<p className="border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-neutral-800 dark:text-gray-400">
							{contact}
						</p>
					)}
				</div>
			</div>
		);
	}

	if (skin === 'soft') {
		return (
			<div className="min-h-full px-4 py-8 sm:py-12">
				<div className="mx-auto max-w-3xl">
					<div className="text-center">
						<h1 className="text-primary text-4xl font-bold sm:text-5xl">{content.title}</h1>
						<p className="bg-accent/10 text-accent mt-4 inline-block rounded-full px-4 py-1.5 text-sm font-bold">
							{translate('legal.updated')}
						</p>
					</div>

					<p className="bg-primary/10 mt-8 rounded-3xl p-6 leading-relaxed text-gray-700 sm:p-8 dark:text-gray-200">
						{withCompany(content.intro)}
					</p>

					<div className="mt-6 flex flex-col gap-4">
						{content.sections.map((section, index) => (
							<section
								key={section.title}
								className="rounded-3xl border border-gray-200/70 bg-white p-6 shadow-sm sm:p-8 dark:border-gray-700 dark:bg-gray-800"
							>
								<h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
									<span className="bg-accent flex size-8 shrink-0 items-center justify-center rounded-full font-sans text-sm text-white">
										{index + 1}
									</span>
									{section.title}
								</h2>
								<div className="mt-3 flex flex-col gap-3">
									{section.body.map((paragraph) => (
										<p key={paragraph} className="leading-relaxed text-gray-600 dark:text-gray-300">
											{withCompany(paragraph)}
										</p>
									))}
								</div>
							</section>
						))}
					</div>

					{contact && (
						<p className="mt-8 rounded-full border-2 border-dashed border-gray-300 px-6 py-3 text-center text-sm text-gray-600 dark:border-gray-600 dark:text-gray-400">
							{contact}
						</p>
					)}
				</div>
			</div>
		);
	}

	if (skin === 'listing') {
		return (
			<div className="min-h-full pb-10">
				<div className="bg-primary text-white">
					<div className="mx-auto max-w-[1336px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
						<h1 className="text-3xl font-bold sm:text-4xl">{content.title}</h1>
						<p className="mt-2 text-sm text-white/80">{translate('legal.updated')}</p>
					</div>
				</div>

				<div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
					<nav className="hidden self-start rounded-lg border border-gray-200 bg-white p-4 lg:sticky lg:top-[calc(var(--header-height,6rem)+1rem)] lg:block dark:border-neutral-800 dark:bg-neutral-900">
						<ol className="space-y-1 text-sm">
							{content.sections.map((section, index) => (
								<li key={section.title}>
									<a
										href={`#section-${index + 1}`}
										className="hover:bg-primary/10 hover:text-primary flex gap-2 rounded px-2 py-1.5 text-gray-700 transition-colors dark:text-gray-300"
									>
										<span className="text-primary font-semibold">{index + 1}.</span>
										{section.title}
									</a>
								</li>
							))}
						</ol>
					</nav>

					<div className="space-y-4 lg:col-span-3">
						<p className="rounded-lg border border-gray-200 bg-white p-5 text-gray-700 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
							{withCompany(content.intro)}
						</p>
						{content.sections.map((section, index) => (
							<section
								key={section.title}
								id={`section-${index + 1}`}
								className="scroll-mt-40 rounded-lg border border-gray-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
							>
								<h2 className="flex gap-3 text-lg font-bold text-gray-900 dark:text-white">
									<span className="bg-primary flex size-7 shrink-0 items-center justify-center rounded text-sm text-white">
										{index + 1}
									</span>
									{section.title}
								</h2>
								<div className="mt-3 flex flex-col gap-2">
									{section.body.map((paragraph) => (
										<p key={paragraph} className="text-gray-600 dark:text-gray-300">
											{withCompany(paragraph)}
										</p>
									))}
								</div>
							</section>
						))}
						{contact && (
							<p className="text-sm text-gray-600 dark:text-gray-400">{contact}</p>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full px-4 py-8">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					{translate('legal.updated')}
				</p>
				<p className="mt-6 text-gray-600 dark:text-gray-300">{withCompany(content.intro)}</p>

				<div className="mt-10 flex flex-col gap-8">
					{content.sections.map((section) => (
						<section key={section.title}>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
								{section.title}
							</h2>
							<div className="mt-2 flex flex-col gap-2">
								{section.body.map((paragraph) => (
									<p key={paragraph} className="text-gray-600 dark:text-gray-300">
										{withCompany(paragraph)}
									</p>
								))}
							</div>
						</section>
					))}
				</div>

				{brand.contact.email && (
					<p className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
						{translate('legal.questions')}{' '}
						<a href={`mailto:${brand.contact.email}`} className="text-primary hover:underline">
							{brand.contact.email}
						</a>
					</p>
				)}
			</div>
		</div>
	);
}
