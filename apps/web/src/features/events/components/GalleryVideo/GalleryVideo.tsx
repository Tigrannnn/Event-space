'use client';

import { useState, type KeyboardEvent } from 'react';
import { Play } from 'lucide-react';
import { autoplayEmbedUrl, parseVideoUrl, type ParsedVideo } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import { cn } from '@/utils/cn';

/** Stands in the list of pictures for the place where the video goes. */
export const GALLERY_VIDEO_SLIDE = 'gallery:video';

/** The pictures of an event with its video, if it has one, put first. */
export function useGallerySlides(videoUrl: string | null | undefined, imageUrls: string[]) {
	const video = parseVideoUrl(videoUrl);
	return { video, slides: video ? [GALLERY_VIDEO_SLIDE, ...imageUrls] : imageUrls };
}

interface VideoTileProps {
	video: ParsedVideo;
	title: string;
	/** Opens the full-size view. The background of the tile does this. */
	onOpen: () => void;
	/** Plays in the full-size view instead of in place, for tiles with text laid over them. */
	playInModal?: boolean;
	className?: string;
}

/**
 * The video as a tile of the gallery. Pressing the play button starts it in place; pressing
 * anywhere else on the tile opens the full-size view, as it would for a picture. The player
 * is only loaded once it is asked for.
 */
export function VideoTile({
	video,
	title,
	onOpen,
	playInModal = false,
	className,
}: VideoTileProps) {
	const translate = useTranslation();
	const [isPlaying, setIsPlaying] = useState(false);

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			onOpen();
		}
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onOpen}
			onKeyDown={onKeyDown}
			aria-label={title}
			className={cn('relative cursor-zoom-in overflow-hidden bg-black', className)}
		>
			{isPlaying ? (
				<iframe
					src={autoplayEmbedUrl(video)}
					title={title}
					className="absolute inset-0 size-full cursor-auto border-0"
					allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
					allowFullScreen
					referrerPolicy="strict-origin-when-cross-origin"
					onClick={(event) => event.stopPropagation()}
				/>
			) : (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={video.thumbnailUrl}
						alt=""
						className="absolute inset-0 size-full object-cover opacity-90"
					/>
					<button
						type="button"
						onClick={(event) => {
							event.stopPropagation();
							if (playInModal) onOpen();
							else setIsPlaying(true);
						}}
						aria-label={`${translate('event.playVideo')}: ${title}`}
						className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-transform hover:scale-105"
					>
						<Play className="ml-1 size-7 fill-current" />
					</button>
				</>
			)}
		</div>
	);
}

/** The video's place in a row of small pictures. */
export function VideoThumb({ video }: { video: ParsedVideo }) {
	return (
		<>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={video.thumbnailUrl} alt="" className="size-full object-cover" />
			<span className="absolute inset-0 flex items-center justify-center bg-black/25">
				<Play className="size-5 fill-white text-white" />
			</span>
		</>
	);
}
