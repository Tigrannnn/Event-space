'use client';

import { useModalStore } from '@/stores/modalStore/modalStore';
import { ConfirmModalData, ModalType } from '@/stores/modalStore/types';

type ConfirmOptions = Omit<ConfirmModalData, 'onConfirm' | 'onCancel'>;

export const useConfirm = () => {
  const { openModal } = useModalStore();

  return (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      openModal(ModalType.Confirm, {
        ...options,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };
};