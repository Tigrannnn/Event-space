import { useEffect, useCallback } from 'react';

interface UseEscapeKeyProps {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Whether to disable ESC key closing (e.g., for important forms) */
  disabled?: boolean;
}

/**
 * Hook that closes modal when Escape key is pressed.
 * 
 * This is a standard accessibility feature that users expect.
 * Can be disabled for important modals where accidental closing should be prevented.
 * 
 * @param isOpen - Whether the modal is open
 * @param onClose - Callback to close the modal
 * @param disabled - Whether to disable ESC key closing
 * 
 * @example
 * ```tsx
 * // Basic usage
 * useEscapeKey({ isOpen, onClose });
 * 
 * // Disable for important forms
 * useEscapeKey({ isOpen, onClose, disabled: isImportantForm });
 * ```
 */
export function useEscapeKey({ isOpen, onClose, disabled = false }: UseEscapeKeyProps) {
  /**
   * Handle Escape key press to close the modal.
   * Using useCallback to memoize the function and prevent unnecessary re-renders.
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disabled) {
        onClose();
      }
    },
    [onClose, disabled]
  );

  useEffect(() => {
    // Only listen for key events when modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Cleanup: remove event listener when modal closes
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);
}
