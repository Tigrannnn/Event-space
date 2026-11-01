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

/**
 * What the tile does while the pointer is on its background, to match the pictures of the same
 * skin down to the 700 ms the picture component gives every such change. It does not happen
 * while the pointer is on the play button, which has its own, nor once the video is playing.
 */
const BACKGROUND_HOVER = {
	scale: {
		base: 'scale-98 transition-transform duration-700',
		hover: '[&:hover:not(:has(button:hover))]:scale-100',
		poster: '',
	},
	fade: {
		base: '',
		hover: '[&:hover:not(:has(button:hover))>img]:opacity-90',
		poster: 'transition-opacity duration-700',
	},
	none: { base: '', hover: '', poster: '' },
} as const;

const PLAY_BUTTON =
	'flex size-16 cursor-pointer items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-lg transition-transform hover:scale-105';

function PlayButton({
	label,
	onPress,
	className,
}: {
	label: string;
	onPress: () => void;
	className?: string;
}) {
	return (
		<button
			type="button"
			onClick={(event) => {
				event.stopPropagation();
				onPress();
			}}
			aria-label={label}
			className={cn(PLAY_BUTTON, className)}
		>
			<Play className="ml-1 size-7 fill-current" />
		</button>
	);
}

interface VideoPlayerProps {
	video: ParsedVideo;
	title: string;
	startPlaying?: boolean;
	className?: string;
}

/** The still with the play button; the player loads only once the button is pressed. */
export function VideoPlayer({ video, title, startPlaying = false, className }: VideoPlayerProps) {
	const translate = useTranslation();
	const [isPlaying, setIsPlaying] = useState(startPlaying);

	return (
		<div className={cn('relative overflow-hidden bg-black', className)}>
			{isPlaying ? (
				<iframe
					src={autoplayEmbedUrl(video)}
					title={title}
					className="absolute inset-0 size-full border-0"
					allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
					allowFullScreen
					referrerPolicy="strict-origin-when-cross-origin"
				/>
			) : (
				<>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={video.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover" />
					<PlayButton
						label={`${translate('event.playVideo')}: ${title}`}
						onPress={() => setIsPlaying(true)}
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
					/>
				</>
			)}
		</div>
	);
}

interface VideoTileProps {
	video: ParsedVideo;
	title: string;
	/** Opens the full-size view. `autoplay` is set when it was the play button that asked. */
	onOpen: (autoplay: boolean) => void;
	/** Opens the full-size view and plays there, for tiles with text laid over them. */
	playInModal?: boolean;
	hover?: keyof typeof BACKGROUND_HOVER;
	className?: string;
}

/**
 * The video as a tile of the gallery. The play button starts it in place; the rest of the tile
 * opens the full-size view, as it would for a picture.
 */
export function VideoTile({
	video,
	title,
	onOpen,
	playInModal = false,
	hover = 'none',
	className,
}: VideoTileProps) {
	const translate = useTranslation();
	const [isPlaying, setIsPlaying] = useState(false);

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			onOpen(false);
		}
	};

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={() => onOpen(false)}
			onKeyDown={onKeyDown}
			aria-label={title}
			className={cn(
				'relative cursor-pointer overflow-hidden bg-black',
				BACKGROUND_HOVER[hover].base,
				!isPlaying && BACKGROUND_HOVER[hover].hover,
				className,
			)}
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
						className={cn('absolute inset-0 size-full object-cover', BACKGROUND_HOVER[hover].poster)}
					/>
					<PlayButton
						label={`${translate('event.playVideo')}: ${title}`}
						onPress={() => (playInModal ? onOpen(true) : setIsPlaying(true))}
						className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
					/>
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
