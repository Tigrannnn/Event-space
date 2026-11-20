export interface ParsedVideo {
	/** The address the player is loaded from. */
	embedUrl: string;
	/** A frame to show before anyone presses play. */
	thumbnailUrl: string;
	/** Where the video lives, for a link out when the player will not open. */
	watchUrl: string;
	/** Shorts are tall; everything else is wide. */
	isVertical: boolean;
}

const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com']);

function youtube(id: string, isVertical: boolean): ParsedVideo | null {
	if (!YOUTUBE_ID.test(id)) return null;
	return {
		embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
		thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
		watchUrl: `https://www.youtube.com/watch?v=${id}`,
		isVertical,
	};
}

/** Reads a YouTube link into what the page needs to play it. Null for anything else. */
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
	if (!YOUTUBE_HOSTS.has(host)) return null;

	if (parts[0] === 'watch') return youtube(url.searchParams.get('v') ?? '', false);
	if (parts[0] === 'shorts') return youtube(parts[1] ?? '', true);
	if (parts[0] === 'embed' || parts[0] === 'live') return youtube(parts[1] ?? '', false);
	return null;
}

/** The player address with autoplay on, for a video opened by pressing play. */
export function autoplayEmbedUrl(video: ParsedVideo): string {
	return `${video.embedUrl}&autoplay=1`;
}
