export type VideoProvider = 'youtube' | 'vimeo' | 'instagram';

export interface ParsedVideo {
	provider: VideoProvider;
	/** The address the player is loaded from. */
	embedUrl: string;
	/** A frame to show before anyone presses play. Only YouTube hands one out without a request. */
	thumbnailUrl: string | null;
	/** Where the video lives, for a link out when the player will not open. */
	watchUrl: string;
	/** Reels and shorts are tall; everything else is wide. */
	isVertical: boolean;
}

const YOUTUBE_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d+$/;
const INSTAGRAM_ID = /^[\w-]+$/;

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com']);
const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com']);
const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

function youtube(id: string, isVertical: boolean): ParsedVideo | null {
	if (!YOUTUBE_ID.test(id)) return null;
	return {
		provider: 'youtube',
		embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
		thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
		watchUrl: `https://www.youtube.com/watch?v=${id}`,
		isVertical,
	};
}

/** Reads a YouTube, Vimeo or Instagram link into what the page needs to play it. Null for anything else. */
export function parseVideoUrl(value: string | null | undefined): ParsedVideo | null {
	const text = value?.trim();
	if (!text) return null;

	let url: URL;
	try {
		url = new URL(text);
	} catch {
		return null;
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

	const host = url.hostname.toLowerCase();
	const parts = url.pathname.split('/').filter(Boolean);

	if (host === 'youtu.be') return youtube(parts[0] ?? '', false);

	if (YOUTUBE_HOSTS.has(host)) {
		if (parts[0] === 'watch') return youtube(url.searchParams.get('v') ?? '', false);
		if (parts[0] === 'shorts') return youtube(parts[1] ?? '', true);
		if (parts[0] === 'embed' || parts[0] === 'live') return youtube(parts[1] ?? '', false);
		return null;
	}

	if (VIMEO_HOSTS.has(host)) {
		const id = parts.find((part) => VIMEO_ID.test(part));
		if (!id) return null;
		const hash = url.searchParams.get('h');
		return {
			provider: 'vimeo',
			embedUrl: `https://player.vimeo.com/video/${id}?playsinline=1${hash ? `&h=${encodeURIComponent(hash)}` : ''}`,
			thumbnailUrl: null,
			watchUrl: `https://vimeo.com/${id}`,
			isVertical: false,
		};
	}

	if (INSTAGRAM_HOSTS.has(host)) {
		const kindIndex = parts.findIndex((part) => part === 'reel' || part === 'reels' || part === 'p' || part === 'tv');
		const id = kindIndex >= 0 ? parts[kindIndex + 1] : undefined;
		if (!id || !INSTAGRAM_ID.test(id)) return null;
		return {
			provider: 'instagram',
			embedUrl: `https://www.instagram.com/${parts[kindIndex] === 'reels' ? 'reel' : parts[kindIndex]}/${id}/embed`,
			thumbnailUrl: null,
			watchUrl: `https://www.instagram.com/${parts[kindIndex] === 'reels' ? 'reel' : parts[kindIndex]}/${id}/`,
			isVertical: true,
		};
	}

	return null;
}
