import { useEffect, RefObject } from 'react';

interface UseFocusTrapProps {
  /** Ref to the modal container element */
  containerRef: RefObject<HTMLElement>;
}

/**
 * Hook that traps focus inside a modal container.
 *
 * When focus reaches the last focusable element, it loops back to the first.
 * This prevents users from tabbing outside the modal while it's open.
 *
 * @param isOpen - Whether the modal is open
 * @param containerRef - Ref to the modal container element
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * useFocusTrap({ containerRef });
 * ```
 */
export function useFocusTrap({ containerRef }: UseFocusTrapProps) {
  useEffect(() => {
    // If modal is closed or no container, do nothing
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Save the element that had focus before modal opened
    // This allows us to restore focus when modal closes
    const previousFocus = document.activeElement as HTMLElement | null;

    // Find all focusable elements inside the modal
    // These are elements that can receive focus via Tab key
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    /**
     * Handle Tab key presses to cycle focus within the modal.
     */
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Tab key
      if (e.key !== 'Tab') return;

      // Shift + Tab on first element → go to last element
      // This creates a loop: first ←→ last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }

      // Tab on last element → go to first element
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    // Listen for Tab key presses on the entire document
    document.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element when modal opens
    // Using requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      firstElement?.focus();
    });

    // Cleanup: remove event listener and restore focus when modal closes
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the element that was focused before modal opened
      // This is critical for keyboard accessibility (WCAG 2.1 Level A)
      previousFocus?.focus();
    };
  }, [containerRef]);
}
