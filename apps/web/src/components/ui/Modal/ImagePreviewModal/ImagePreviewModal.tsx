'use client';

import { useCallback, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useModalStore, useModalData } from '@/stores/modalStore/modalStore';
import { ModalType } from '@/stores/modalStore/types';
import Modal from '../Modal';
import Image from 'next/image';

export default function ImagePreviewModal() {
	const { activeModal, closeModal } = useModalStore();
	const modalData = useModalData(ModalType.ImagePreview);

	const images = modalData?.images ?? [];
	const initialIndex = modalData?.initialIndex ?? 0;

	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	// Synchronize currentIndex when the modal opens or initialIndex changes
	useEffect(() => {
		if (activeModal === ModalType.ImagePreview && typeof initialIndex === 'number') {
			setCurrentIndex(initialIndex);
		}
	}, [activeModal, initialIndex]);

	const handlePrevious = useCallback(() => {
		setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
	}, [images.length]);

	const handleNext = useCallback(() => {
		setCurrentIndex((prev) => (prev + 1) % images.length);
	}, [images.length]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') handlePrevious();
			if (e.key === 'ArrowRight') handleNext();
		},
		[handlePrevious, handleNext],
	);

	useEffect(() => {
		if (activeModal === ModalType.ImagePreview) {
			window.addEventListener('keydown', handleKeyDown);
			return () => window.removeEventListener('keydown', handleKeyDown);
		}
	}, [activeModal, handleKeyDown]);

	const isOpen = activeModal === ModalType.ImagePreview;

	// Guard against empty images or invalid index to prevent Next.js Image errors
	const currentImage = images[currentIndex];

	return (
		<Modal
			isOpen={isOpen}
			onClose={closeModal}
			size="full"
			position="center"
			contentClassName="bg-transparent shadow-none max-h-none overflow-visible"
			backdropClassName="bg-black/95 backdrop-blur-sm"
			ariaLabel="Image preview"
		>
			{isOpen && currentImage && (
				<div className="relative flex min-h-[90vh] items-center justify-center">
					{/* Close button */}
					<button
						onClick={closeModal}
						className="absolute top-3 right-3 z-50 cursor-pointer rounded-full bg-black/60 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 sm:top-4 sm:right-4"
						aria-label="Close"
					>
						<X className="h-6 w-6 text-white sm:h-7 sm:w-7" />
					</button>

					{/* Navigation - Left */}
					{images.length > 1 && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handlePrevious();
							}}
							className="absolute top-1/2 left-2 z-50 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 sm:left-4 sm:p-3"
							aria-label="Previous image"
						>
							<ChevronLeft className="h-6 w-6 text-white sm:h-7 sm:w-7" />
						</button>
					)}

					{/* Image */}
					<div className="relative h-[95dvh] w-full p-2">
						<div className="relative h-full w-full">
							<Image
								src={currentImage}
								alt={`Preview ${currentIndex + 1}`}
								fill
								className="rounded-2xl object-contain"
								onClick={(e) => e.stopPropagation()}
								priority
							/>
						</div>
					</div>

					{/* Navigation - Right */}
					{images.length > 1 && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleNext();
							}}
							className="absolute top-1/2 right-2 z-50 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 p-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 sm:right-4 sm:p-3"
							aria-label="Next image"
						>
							<ChevronRight className="h-6 w-6 text-white sm:h-7 sm:w-7" />
						</button>
					)}

					{/* Counter */}
					{images.length > 1 && (
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 cursor-default rounded-full bg-black/60 px-5 py-2.5 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/80 sm:bottom-8">
							<span className="text-base font-medium text-white sm:text-sm">
								{currentIndex + 1} / {images.length}
							</span>
						</div>
					)}
				</div>
			)}
		</Modal>
	);
}
