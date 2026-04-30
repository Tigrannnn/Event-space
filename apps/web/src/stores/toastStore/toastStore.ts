import { create } from 'zustand';
import { Toast, ToastType } from './types';
import { v4 as uuid } from 'uuid';

interface ToastState {
	toasts: Toast[];
	addToast: (message: string, type: ToastType) => void;
	removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
	toasts: [],

	addToast: (message, type) => {
		const id = uuid().toString();

		set((state: ToastState) => {
			const newToast = { id, message, type };

			const updatedToasts =
				state.toasts.length >= 8 ? [...state.toasts.slice(1), newToast] : [...state.toasts, newToast];

			setTimeout(() => {
				state.removeToast(id);
			}, 3000);

			return { toasts: updatedToasts };
		});
	},

	removeToast: (id) => {
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		}));
	},
}));
