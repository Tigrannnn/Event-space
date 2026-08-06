'use client';

import { copyToClipboard } from '@/lib/clipboard';
import { useTranslation } from '@/hooks/translation';
import { ToastType, useToastStore } from '@/stores/toastStore';
import type { MessageKey } from '@/lib/i18n/messages';

/**
 * Copies text and reports the outcome as a toast, so the six call sites that copy an ID or a link
 * don't each re-implement "did it work, what do I tell the user".
 */
export function useCopyToClipboard() {
	const translate = useTranslation();
	const addToast = useToastStore((state) => state.addToast);

	return async (text: string, successKey: MessageKey, failureKey: MessageKey = 'common.copyFailed') => {
		const succeeded = await copyToClipboard(text);
		addToast(translate(succeeded ? successKey : failureKey), succeeded ? ToastType.SUCCESS : ToastType.ERROR);
		return succeeded;
	};
}
