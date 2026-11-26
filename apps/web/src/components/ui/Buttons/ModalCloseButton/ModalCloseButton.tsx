'use client';

import { ModalCloseButtonProps } from './types';
import { useTranslation } from '@/hooks/translation';

export default function ModalCloseButton({
	onClick,
	'aria-label': ariaLabel,
	className = '',
	...props
}: ModalCloseButtonProps) {
	const translate = useTranslation();

	return (
		<button
			// A bare <button> inside a <form> submits it: closing a form's modal ran its validation
			// and, with every field valid, saved it instead of closing.
			type="button"
			onClick={onClick}
			className={`absolute top-0 right-0 cursor-pointer rounded-full in-data-[skin=listing]:rounded-md in-data-[skin=market]:rounded-xl in-data-[skin=drawer]:bg-gray-100 in-data-[skin=drawer]:dark:bg-neutral-800 in-data-[skin=capsule]:bg-(--capsule-wash) in-data-[skin=capsule]:text-primary in-data-[skin=capsule]:hover:bg-primary in-data-[skin=capsule]:hover:text-white p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 ${className}`}
			aria-label={ariaLabel ?? translate('common.close')}
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
