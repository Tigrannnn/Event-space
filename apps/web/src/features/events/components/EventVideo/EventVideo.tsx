'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { parseVideoUrl } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';

interface EventVideoProps {
	videoUrl?: string | null;
	title: string;
	posterUrl?: string;
	className?: string;
}

const PROVIDER_NAMES = { youtube: 'YouTube', vimeo: 'Vimeo', instagram: 'Instagram' } as const;

/**
 * The tour's video, shown as a still with a play button. The player only loads once it is
 * pressed, so a page with a video weighs the same as one without until someone asks to see it.
 */
export function EventVideo({ videoUrl, title, posterUrl, className }: EventVideoProps) {
	const translate = useTranslation();
	const [isPlaying, setIsPlaying] = useState(false);
	const video = parseVideoUrl(videoUrl);

	if (!video) return null;

	const poster = video.thumbnailUrl ?? posterUrl;
	const autoplayUrl = `${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`;

	return (
		<section className={className}>
			<h2 className="mb-3 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
				{translate('event.video')}
			</h2>
			<div
				className={cn(
					'relative w-full overflow-hidden rounded-2xl bg-gray-900 in-data-[skin=minimal]:rounded-xl in-data-[skin=listing]:rounded-md',
					video.isVertical ? 'mx-auto aspect-9/16 max-h-[70vh] max-w-sm' : 'aspect-video',
				)}
			>
				{isPlaying ? (
					<iframe
						src={video.provider === 'instagram' ? video.embedUrl : autoplayUrl}
						title={title}
						className="absolute inset-0 size-full border-0"
						allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
						allowFullScreen
						referrerPolicy="strict-origin-when-cross-origin"
					/>
				) : (
					<button
						type="button"
						onClick={() => setIsPlaying(true)}
						aria-label={`${translate('event.playVideo')}: ${title}`}
						className="group absolute inset-0 flex cursor-pointer items-center justify-center"
					>
						{poster && (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={poster}
								alt=""
								loading="lazy"
								className="absolute inset-0 size-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
							/>
						)}
						<span className="relative flex size-16 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-transform group-hover:scale-105">
							<Play className="ml-1 size-7 fill-current" />
						</span>
						<span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
							{PROVIDER_NAMES[video.provider]}
						</span>
					</button>
				)}
			</div>
		</section>
	);
}
