import type { Locale } from '@event-space/shared';
import { en } from './en';
import { ru } from './ru';
import { hy } from './hy';
import type { MessageKey, Messages } from './types';

export type { Messages, MessageKey } from './types';

export const messages: Record<Locale, Messages> = { hy, ru, en };

export function getMessages(locale: Locale): Messages {
	return messages[locale];
}

/** Values substituted into a message's `{placeholders}`. */
export type MessageParams = Record<string, string | number>;

function interpolate(template: string, params: MessageParams): string {
	// An unknown placeholder is left as written, so a missing param reads as a visible
	// gap rather than silently emptying part of the sentence.
	return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
		name in params ? String(params[name]) : placeholder,
	);
}

export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
	let node: unknown = messages[locale];

	for (const part of key.split('.')) {
		if (typeof node !== 'object' || node === null || !(part in node)) {
			return key;
		}
		node = (node as Record<string, unknown>)[part];
	}

	if (typeof node !== 'string') return key;

	return params ? interpolate(node, params) : node;
}
