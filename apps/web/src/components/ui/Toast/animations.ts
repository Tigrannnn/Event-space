export const ToastVariants = {
  initial: { opacity: 0, y: 20, scale: 0.85 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } }
};

export const ToastVariantsByPlacement = {
  fromBottom: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 12, transition: { duration: 0.18 } }
  },
  fromTop: {
    initial: { opacity: 0, y: -24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12, transition: { duration: 0.18 } }
  }
};
