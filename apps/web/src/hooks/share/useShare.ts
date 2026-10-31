'use client';

import { useModalStore } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';

/**
 * Sharing on a phone goes through the system sheet, which already lists the person's own
 * messengers. Everywhere else, and when the sheet is missing or fails, our modal takes over.
 */
export function useShare() {
	const { openModal } = useModalStore();

	return async (title: string) => {
		const url = window.location.href;
		const hasTouchScreen = window.matchMedia('(pointer: coarse)').matches;

		if (hasTouchScreen && typeof navigator.share === 'function') {
			try {
				await navigator.share({ title, url });
				return;
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') return;
			}
		}

		openModal(ModalType.Share, { title, url });
	};
}
