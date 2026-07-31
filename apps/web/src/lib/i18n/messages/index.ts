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

export function translate(locale: Locale, key: MessageKey): string {
	let node: unknown = messages[locale];

	for (const part of key.split('.')) {
		if (typeof node !== 'object' || node === null || !(part in node)) {
			return key;
		}
		node = (node as Record<string, unknown>)[part];
	}

	return typeof node === 'string' ? node : key;
}
