/**
 * Options for data someone else can change while it is on screen: an admin watching revenue
 * while a client pays, or spots left on a tour date while someone fills the booking form.
 *
 * staleTime shorter than the interval means a tab switch or window focus also refreshes it,
 * not just the timer — see QueryProvider for why that matters.
 */
export const LIVE_QUERY_OPTIONS = {
	staleTime: 15 * 1000,
	refetchInterval: 20 * 1000,
} as const;

/** Same idea, for data worth refreshing but not worth watching closely (a sidebar badge). */
export const LIVE_BADGE_QUERY_OPTIONS = {
	staleTime: 20 * 1000,
	refetchInterval: 30 * 1000,
} as const;

/** For a public page with many concurrent visitors: still live, just less aggressive. */
export const PUBLIC_LIVE_QUERY_OPTIONS = {
	staleTime: 20 * 1000,
	refetchInterval: 30 * 1000,
} as const;
