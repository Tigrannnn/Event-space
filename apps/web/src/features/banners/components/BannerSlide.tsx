'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getBannerHref, getBannerTranslation, optimizeImageUrl } from '@event-space/shared';
import type { Banner, Locale } from '@event-space/shared';
import { localizePath } from '@/lib/i18n/config';
import { cn } from '@/utils/cn';

interface BannerSlideProps {
	banner: Banner;
	locale: Locale;
	/** The first slide is the largest thing on the page, so it loads ahead of everything else. */
	isPriority: boolean;
}

const ALIGNMENT = {
	LEFT: 'items-start text-left',
	CENTER: 'items-center text-center',
	RIGHT: 'items-end text-right',
} as const;

/** The picture has to stay readable under the text, whichever side the text sits on. */
const SCRIM = {
	LEFT: {
		DARK: 'bg-linear-to-r from-black/70 via-black/40 to-transparent',
		LIGHT: 'bg-linear-to-r from-white/80 via-white/50 to-transparent',
	},
	RIGHT: {
		DARK: 'bg-linear-to-l from-black/70 via-black/40 to-transparent',
		LIGHT: 'bg-linear-to-l from-white/80 via-white/50 to-transparent',
	},
	CENTER: {
		DARK: 'bg-black/45',
		LIGHT: 'bg-white/60',
	},
} as const;

export default function BannerSlide({ banner, locale, isPriority }: BannerSlideProps) {
	const text = getBannerTranslation(banner, locale);
	const href = getBannerHref(banner);
	const isExternal = banner.targetType === 'URL';
	const isDark = banner.theme === 'DARK';

	const content = (
		<>
			<Image
				src={optimizeImageUrl(banner.imageUrl)}
				alt=""
				fill
				sizes="100vw"
				priority={isPriority}
				className="object-cover"
				unoptimized
			/>

			<div className={cn('absolute inset-0', SCRIM[banner.textAlign][banner.theme])} />

			<div
				className={cn(
					'absolute inset-0 flex flex-col justify-center gap-2 p-5 sm:gap-3 sm:p-10 lg:p-14',
					ALIGNMENT[banner.textAlign],
				)}
			>
				<p
					className={cn(
						'max-w-xl text-xl leading-tight font-black uppercase sm:text-3xl lg:text-4xl',
						isDark ? 'text-white' : 'text-gray-900',
					)}
				>
					{text.title}
				</p>

				{text.subtitle && (
					<p
						className={cn(
							'max-w-lg text-sm sm:text-base',
							isDark ? 'text-white/85' : 'text-gray-700',
						)}
					>
						{text.subtitle}
					</p>
				)}
			</div>
		</>
	);

	const slideClassName = 'relative block h-full w-full overflow-hidden';

	if (!href) {
		return <div className={slideClassName}>{content}</div>;
	}

	if (isExternal) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				className={slideClassName}
				aria-label={text.title}
			>
				{content}
			</a>
		);
	}

	return (
		<Link href={localizePath(href, locale)} className={slideClassName} aria-label={text.title}>
			{content}
		</Link>
	);
}
