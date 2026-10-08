'use client';

import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';
import { messages } from '@/lib/i18n/messages';

interface LegalPageContentProps {
	document: 'privacy' | 'terms';
}

export default function LegalPageContent({ document }: LegalPageContentProps) {
	const translate = useTranslation();
	const brand = useBrand();
	const content = messages[translate.locale].legal[document];
	const withCompany = (text: string) => text.replaceAll('{company}', brand.name);

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
