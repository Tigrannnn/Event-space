import { create } from 'zustand';
import type { ModalDataMap, ModalStore, ModalType } from './types';

export const useModalStore = create<ModalStore>((set) => ({
	activeModal: null,
	modalData: null,

	openModal: (...args) => {
		const [modalType, data] = args as [ModalType, ModalDataMap[ModalType] | undefined];
		set({
			activeModal: modalType,
			modalData: (data ?? null) as ModalDataMap[keyof ModalDataMap] | null,
		});
	},

	closeModal: () => {
		set({ activeModal: null, modalData: null });
	},
}));

/**
 * Typed selector for modal data.
 * Returns null if the active modal does not match the requested type.
 */
export function useModalData<T extends ModalType>(type: T): ModalDataMap[T] | null {
	return useModalStore((state) =>
		state.activeModal === type ? (state.modalData as ModalDataMap[T]) : null,
	);
}
