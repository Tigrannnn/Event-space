import { ReactNode } from 'react';

/**
 * Modal size options.
 * Determines the maximum width of the modal.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal position options.
 * Determines where the modal appears on the screen.
 */
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  /** Whether the modal is open or closed */
  isOpen: boolean;

  /** Callback function to close the modal */
  onClose: () => void;

  /** Modal content */
  children: ReactNode;
  
  /** Modal size (default: 'md') */
  size?: ModalSize;
  
  /** Modal position on screen (default: 'center') */
  position?: ModalPosition;
  
  /** Disable closing on ESC key press (default: false) */
  disableEscapeClose?: boolean;
  
  /** Disable closing on backdrop click (default: false) */
  disableBackdropClose?: boolean;
  
  /** Custom className for content container */
  contentClassName?: string;
  
  /** Custom className for backdrop */
  backdropClassName?: string;

  /** Aria label for accessibility (required for screen readers) */
  ariaLabel: string;

  /** Prevent body scroll when modal is open (default: true) */
  preventScroll?: boolean;
}
