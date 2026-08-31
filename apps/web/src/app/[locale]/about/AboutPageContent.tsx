'use client';

import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';

export default function AboutPageContent() {
	const translate = useTranslation();
	const brand = useBrand();
	const about = brand.about[translate.locale];

	return (
		<div className="min-h-full px-4 py-8">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">{brand.name}</h1>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{about.tagline}</p>

				<div className="mt-10 flex flex-col gap-8">
					<section>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{translate('about.missionTitle')}
						</h2>
						<p className="mt-2 text-gray-600 dark:text-gray-300">{about.missionBody}</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{translate('about.storyTitle')}
						</h2>
						<p className="mt-2 text-gray-600 dark:text-gray-300">{about.storyBody}</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{translate('about.contactTitle')}
						</h2>
						<p className="mt-2 text-gray-600 dark:text-gray-300">{about.contactBody}</p>
					</section>
				</div>
			</div>
		</div>
	);
}
