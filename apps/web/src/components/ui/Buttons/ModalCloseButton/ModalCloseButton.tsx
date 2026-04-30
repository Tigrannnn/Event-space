'use client';

import { ModalCloseButtonProps } from './types';

export default function ModalCloseButton({
	onClick,
	'aria-label': ariaLabel = 'Close modal',
	className = '',
	...props
}: ModalCloseButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`absolute top-0 right-0 cursor-pointer rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${className}`}
			aria-label={ariaLabel}
			{...props}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				className="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
			>
				<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	);
}
