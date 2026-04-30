'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { usePreventScroll } from '@react-aria/overlays';
import type { ModalPosition, ModalProps, ModalSize } from './Modal.types';
import { modalVariants, backdropVariants } from './Modal.animations';
import { useFocusTrap, useEscapeKey } from './hooks';
import { useClickOutside } from '@/hooks/clickOutside';

/**
 * Universal Modal component with backdrop and animations.
 *
 * Features:
 * - Focus trap (Tab cycles inside modal)
 * - ESC key to close
 * - Prevents body scroll
 * - ARIA attributes for accessibility
 * - Click outside to close (backdrop + document level)
 * - Configurable size and position
 *
 * Usage:
 * ```tsx
 * <Modal isOpen={isOpen} onClose={closeModal}>
 *   <YourContent />
 * </Modal>
 * ```
 */
export default function Modal({
	isOpen,
	onClose,
	children,
	size = 'md',
	position = 'center',
	disableEscapeClose = false,
	disableBackdropClose = false,
	contentClassName = '',
	backdropClassName = '',
	ariaLabel,
	preventScroll = true,
}: ModalProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	// Accessibility hooks
	useFocusTrap({ isOpen, containerRef: containerRef as React.RefObject<HTMLElement> });
	useEscapeKey({ isOpen, onClose, disabled: disableEscapeClose });
	usePreventScroll({ isDisabled: !isOpen || !preventScroll });

	// Close on click outside modal (document level)
	useClickOutside({
		ref: containerRef,
		onClickOutside: onClose,
		enabled: isOpen && !disableBackdropClose,
		ignoreRefs: [],
	});

	// Handle backdrop click (direct)
	const handleBackdropClick = () => {
		if (!disableBackdropClose) {
			onClose();
		}
	};

	return (
		<>
			{/* Backdrop with fade animation */}
			<motion.div
				variants={backdropVariants}
				initial="hidden"
				animate="visible"
				exit="exit"
				className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm dark:bg-black/70 ${backdropClassName}`}
				onClick={handleBackdropClick}
				aria-hidden="true"
			/>

			{/* Modal content with zoom animation */}
			<div
				className={`fixed inset-0 z-50 flex ${getPositionClass(position)} pointer-events-none overflow-y-auto p-3 sm:p-4`}
			>
				<motion.div
					ref={containerRef}
					variants={modalVariants}
					initial="hidden"
					animate="visible"
					exit="exit"
					className={`w-full ${getSizeClass(size)} ${contentClassName} pointer-events-auto max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl sm:rounded-3xl dark:bg-gray-900 dark:text-white dark:shadow-black/50`}
					role="dialog"
					aria-modal="true"
					aria-labelledby="modal-title"
				>
					{/* Title for screen readers */}
					<h2 id="modal-title" className="sr-only">
						{ariaLabel}
					</h2>
					{children}
				</motion.div>
			</div>
		</>
	);
}

/**
 * Get Tailwind class for modal size.
 */
function getSizeClass(size: ModalSize): string {
	const sizeMap: Record<ModalSize, string> = {
		sm: 'max-w-[90vw] sm:max-w-sm', // 90% mobile, 384px desktop
		md: 'max-w-[90vw] sm:max-w-md', // 448px
		lg: 'max-w-[92vw] sm:max-w-lg', // 512px
		xl: 'max-w-[92vw] sm:max-w-xl', // 576px
		full: 'max-w-[95vw]', // 95% viewport width
	};
	return sizeMap[size];
}

/**
 * Get Tailwind class for modal position.
 */
function getPositionClass(position: ModalPosition): string {
	const positionMap: Record<ModalPosition, string> = {
		center: 'items-center justify-center',
		top: 'items-start justify-center pt-10',
		bottom: 'items-end justify-center pb-10',
		left: 'items-start justify-start pl-10',
		right: 'items-end justify-end pr-10',
	};
	return positionMap[position];
}
