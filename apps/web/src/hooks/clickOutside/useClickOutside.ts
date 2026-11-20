import { useEffect } from 'react';
import type { UseClickOutsideOptions } from './types';

const FLOATING_LAYER = '[data-radix-popper-content-wrapper], [data-radix-portal]';

function isInFloatingLayer(target: Node): boolean {
  if (!target.isConnected) return true;
  const element = target instanceof Element ? target : target.parentElement;
  return Boolean(element?.closest(FLOATING_LAYER));
}

/**
 * Hook that detects clicks outside a specified element.
 * Works at document level, independent of z-index.
 */
export function useClickOutside({
  ref,
  onClickOutside,
  enabled = true,
  ignoreRefs = [],
}: UseClickOutsideOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (ref.current && !ref.current.contains(target) && !isInFloatingLayer(target)) {
        const isIgnored = ignoreRefs.some((ignoreRef) => 
          ignoreRef.current && ignoreRef.current.contains(target)
        );

        if (!isIgnored) {
          onClickOutside();
        }
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, onClickOutside, enabled, ignoreRefs]);
}