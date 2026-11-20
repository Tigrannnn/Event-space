export function sourceLink(code: string): string {
	const origin = typeof window === 'undefined' ? '' : window.location.origin;
	return `${origin}/?ref=${encodeURIComponent(code)}`;
}
