import { Variants } from 'framer-motion';

/**
 * Animation variants for the modal backdrop.
 * Simple fade in/out animation.
 */
export const backdropVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.25,
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.25,
    }
  },
};

/**
 * Animation variants for the modal content.
 * Zoom in/out animation with smooth easing.
 */
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { 
      duration: 0.25,
      ease: [0.4, 0, 0.2, 1]
    }
  },
};
