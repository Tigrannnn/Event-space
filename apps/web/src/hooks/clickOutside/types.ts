/**
 * Options for the useClickOutside hook.
 */
export interface UseClickOutsideOptions {
  /** Callback when click outside is detected */
  onClickOutside: () => void;
  /** Whether the hook should be active */
  enabled?: boolean;
  /** Elements to ignore (refs) */
  ignoreRefs?: React.RefObject<HTMLElement | null>[];
  /** Ref of the element to detect outside clicks */
  ref: React.RefObject<HTMLElement | null>;
}