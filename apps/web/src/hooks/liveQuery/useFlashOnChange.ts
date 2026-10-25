import { useEffect, useRef, useState } from 'react';

/**
 * True for a short moment right after `value` changes — not on the first render, so a widget
 * does not flash the instant it mounts with whatever it loaded.
 */
export function useFlashOnChange<T>(value: T, durationMs = 900): boolean {
	const previous = useRef(value);
	const mounted = useRef(false);
	const [isFlashing, setIsFlashing] = useState(false);

	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			previous.current = value;
			return;
		}

		if (previous.current === value) return;
		previous.current = value;

		setIsFlashing(true);
		const timeout = setTimeout(() => setIsFlashing(false), durationMs);
		return () => clearTimeout(timeout);
	}, [value, durationMs]);

	return isFlashing;
}
