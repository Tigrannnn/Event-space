export {};

declare global {
	interface Window {
		/** Public API origin, injected by the root layout at request time. */
		__PUBLIC_API_URL__?: string;
	}
}
