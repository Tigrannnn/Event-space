import { useEffect, useCallback } from 'react';

interface UseEscapeKeyProps {
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
 * @param onClose - Callback to close the modal
 * @param disabled - Whether to disable ESC key closing
 * 
 * @example
 * ```tsx
 * // Basic usage
 * useEscapeKey({ onClose });
 * 
 * // Disable for important forms
 * useEscapeKey({ onClose, disabled: isImportantForm });
 * ```
 */
export function useEscapeKey({ onClose, disabled = false }: UseEscapeKeyProps) {
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
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup: remove event listener when modal closes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
