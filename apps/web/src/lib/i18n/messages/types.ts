import type { en } from './en';

/**
 * The English catalogue is the source of truth for the message shape: every other
 * locale is typed against it, so a missing or misspelled key is a compile error
 * instead of a string that silently falls back to its own key at runtime.
 */
export type Messages = typeof en;

/**
 * Generate dot-notation keys for nested messages of arbitrary depth.
 * Examples: "common.appTitle", "admin.payment.offline", etc.
 */
type DotNotation<T> = T extends object
	? {
			[K in keyof T & string]: T[K] extends object ? `${K}` | `${K}.${DotNotation<T[K]>}` : `${K}`;
		}[keyof T & string]
	: '';

export type MessageKey = DotNotation<Messages>;
