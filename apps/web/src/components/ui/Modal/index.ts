// Component
export { default as Modal } from './Modal';
export { default as ImagePreviewModal } from './ImagePreviewModal';
export { default as ConfirmModal } from './ConfirmModal';
export { default as ModalHeader } from './ModalHeader';
export { default as ModalDivider } from './ModalDivider';
export { default as ModalFooter } from './ModalFooter';

// Types
export type { ModalProps, ModalSize, ModalPosition } from './Modal.types';
export type { ModalFooterProps } from './ModalFooter';
export type { ModalDividerProps } from './ModalDivider';
export type { ModalHeaderProps } from './ModalHeader';

// Hooks (re-export from hooks folder)
export { useFocusTrap, useEscapeKey } from './hooks';
