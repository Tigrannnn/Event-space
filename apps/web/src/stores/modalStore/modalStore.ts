import { create } from 'zustand';
import type { ModalDataMap, ModalStore, ModalType } from './types';

export const useModalStore = create<ModalStore>((set) => ({
	activeModal: null,
	isExiting: false,
	modalData: null,

	openModal: (...args) => {
		const [modalType, data] = args as [ModalType, ModalDataMap[ModalType] | undefined];
		set({
			activeModal: modalType,
			isExiting: false,
			modalData: (data ?? null) as ModalDataMap[keyof ModalDataMap] | null,
		});
	},

	closeModal: () => {
		set(() => ({ isExiting: true }));
	},

	clearModalData: () => {
		set(() => ({ isExiting: false, modalData: null, activeModal: null }));
	},
}));

/**
 * Typed selector for modal data.
 * Keeps data available while the modal is playing its exit animation.
 */
export function useModalData<T extends ModalType>(type: T): ModalDataMap[T] | null {
	return useModalStore((state) =>
		state.activeModal === type ? (state.modalData as ModalDataMap[T]) : null,
	);
}
