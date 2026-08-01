'use client';

import { isGenericAppErrorCode, resolveApiError } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';
import type { MessageKey } from '@/lib/i18n/messages';

/**
 * Turns a failed request into a message in the user's language.
 *
 * The English text the API sends is never read — it exists for logs. Everything shown to
 * the user is resolved from the error's code, so untranslated backend copy cannot leak
 * into the UI.
 *
 * `fallbackKey` is used only when the error carries no domain code, which is when a
 * message written for this particular call ("Could not cancel the booking") beats the
 * generic one ("Something went wrong"). A domain code always wins over it.
 */
export function useApiError() {
	const translate = useTranslation();

	return (error: unknown, fallbackKey?: MessageKey): string => {
		const { code, params } = resolveApiError(error);

		if (fallbackKey && isGenericAppErrorCode(code)) {
			return translate(fallbackKey);
		}

		return translate(`apiErrors.${code}`, params);
	};
}
