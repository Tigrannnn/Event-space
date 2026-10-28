'use client';

import { History, Mail, Target, type LucideIcon } from 'lucide-react';
import ContactIcons from '@/components/layout/Header/ContactIcons';
import { useTranslation } from '@/hooks/translation';
import { useBrand, useSkin } from '@/providers/BrandProvider';

export default function AboutPageContent() {
	const translate = useTranslation();
	const brand = useBrand();
	const skin = useSkin();
	const about = brand.about[translate.locale];

	const sections: { key: string; title: string; body: string; Icon: LucideIcon }[] = [
		{ key: 'mission', title: translate('about.missionTitle'), body: about.missionBody, Icon: Target },
		{ key: 'story', title: translate('about.storyTitle'), body: about.storyBody, Icon: History },
		{ key: 'contact', title: translate('about.contactTitle'), body: about.contactBody, Icon: Mail },
	];

	if (skin === 'minimal') {
		return (
			<div className="min-h-full px-4 py-10 sm:py-16">
				<div className="mx-auto max-w-2xl">
					<h1 className="text-4xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
						{brand.name}
					</h1>
					<p className="mt-4 text-xl text-gray-600 dark:text-gray-400">{about.tagline}</p>

					<div className="mt-12 divide-y divide-gray-200 border-t border-gray-200 dark:divide-neutral-800 dark:border-neutral-800">
						{sections.map(({ key, title, body }) => (
							<section key={key} className="py-8">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
								<p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{body}</p>
								{key === 'contact' && <ContactIcons className="mt-4 -ml-2.5" />}
							</section>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (skin === 'listing') {
		return (
			<div className="min-h-full pb-10">
				<div className="bg-primary text-white">
					<div className="mx-auto max-w-[1336px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
						<h1 className="text-3xl font-bold sm:text-4xl">{brand.name}</h1>
						<p className="mt-2 max-w-2xl text-lg text-white/85">{about.tagline}</p>
					</div>
				</div>

				<div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
					{sections.map(({ key, title, body, Icon }) => (
						<section
							key={key}
							className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900"
						>
							<span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-md">
								<Icon className="size-6" strokeWidth={1.75} />
							</span>
							<h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
							<p className="mt-2 text-gray-600 dark:text-gray-300">{body}</p>
							{key === 'contact' && <ContactIcons square className="mt-4 gap-1.5" />}
						</section>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full px-4 py-8">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{brand.name}</h1>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{about.tagline}</p>

				<div className="mt-10 flex flex-col gap-8">
					{sections.map(({ key, title, body }) => (
						<section key={key}>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
							<p className="mt-2 text-gray-600 dark:text-gray-300">{body}</p>
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
