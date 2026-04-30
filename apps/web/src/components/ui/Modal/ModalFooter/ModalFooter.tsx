'use client';

import type { ModalFooterProps } from './types';

export default function ModalFooter({ question, actionLabel, onActionClick }: ModalFooterProps) {
	return (
		<p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
			{question}{' '}
			<button
				onClick={onActionClick}
				className="text-primary cursor-pointer font-bold transition-all hover:underline"
			>
				{actionLabel}
			</button>
		</p>
	);
}
