'use client';

import { useToastStore } from '@/stores/toastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastVariants } from './animations';

export function ToastContainer() {
	const { toasts, removeToast } = useToastStore();

	return (
		<div className="pointer-events-none fixed right-4 bottom-20 left-4 z-50 flex flex-col gap-2 sm:right-8 sm:bottom-8 sm:left-auto">
			<AnimatePresence>
				{toasts.map((toast) => (
					<motion.div
						layout
						key={toast.id}
						variants={ToastVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						className={`pointer-events-auto cursor-pointer rounded-full px-5 py-3 text-[15px] font-medium text-white shadow-lg sm:px-8 sm:py-4 sm:text-base ${toast.type === 'success' ? 'bg-primary' : ''} ${toast.type === 'error' ? 'bg-red-500' : ''} ${toast.type === 'info' ? 'bg-gray-700 dark:bg-gray-800' : ''} `}
						onClick={() => removeToast(toast.id)}
					>
						{toast.message}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
