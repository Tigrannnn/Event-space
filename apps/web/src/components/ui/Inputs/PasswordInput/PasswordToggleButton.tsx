'use client';

import { EyeIcon, EyeOffIcon } from './PasswordIcons';
import type { PasswordToggleButtonProps } from './types';

export default function PasswordToggleButton({
	showPassword,
	onToggle,
}: PasswordToggleButtonProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
			aria-label={showPassword ? 'Hide password' : 'Show password'}
		>
			{showPassword ? <EyeOffIcon /> : <EyeIcon />}
		</button>
	);
}
