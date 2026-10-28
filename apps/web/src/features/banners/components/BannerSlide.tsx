'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getBannerHref, getBannerTranslation, optimizeImageUrl } from '@event-space/shared';
import type { Banner, Locale } from '@event-space/shared';
import { localizePath } from '@/lib/i18n/config';
import { cn } from '@/utils/cn';
import { useSkin } from '@/providers/BrandProvider';
import { ArrowRight } from 'lucide-react';

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
	const skin = useSkin();
	const isMinimal = skin === 'minimal';
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';

	const minimalContent = (
		<div className="grid h-full w-full grid-rows-[11rem_1fr] bg-gray-50 sm:grid-cols-5 sm:grid-rows-1 dark:bg-neutral-900">
			<div className="relative sm:order-2 sm:col-span-3">
				<Image
					src={optimizeImageUrl(banner.imageUrl)}
					alt=""
					fill
					sizes="(min-width: 640px) 60vw, 100vw"
					priority={isPriority}
					className="object-cover"
					unoptimized
				/>
			</div>
			<div className="flex flex-col justify-center gap-3 p-6 sm:order-1 sm:col-span-2 sm:p-10">
				{text.title && (
					<p className="text-2xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
						{text.title}
					</p>
				)}
				{text.subtitle && <p className="text-base text-gray-600 dark:text-gray-300">{text.subtitle}</p>}
				{href && (
					<span className="bg-primary mt-1 flex size-10 items-center justify-center rounded-full text-white">
						<ArrowRight className="size-5" />
					</span>
				)}
			</div>
		</div>
	);

	const content = isMinimal ? (
		minimalContent
	) : (
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
				{text.title && (
					<p
						className={cn(
							'max-w-xl text-xl leading-tight font-black sm:text-3xl lg:text-4xl',
							isSoft ? 'font-(family-name:--font-display)' : !isListing && 'uppercase',
							isDark ? 'text-white' : 'text-gray-900',
						)}
					>
						{text.title}
					</p>
				)}

				{text.subtitle && (
					<p className={cn('max-w-lg text-sm sm:text-base', isDark ? 'text-white/85' : 'text-gray-700')}>
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
				aria-label={text.title || href}
			>
				{content}
			</a>
		);
	}

	return (
		<Link
			href={localizePath(href, locale)}
			className={slideClassName}
			aria-label={text.title || href}
		>
			{content}
		</Link>
	);
}
