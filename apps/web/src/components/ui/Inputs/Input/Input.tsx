import { cn } from '@/utils/cn';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className, ...props }, ref) => {
		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={props.id}
						className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					className={cn(`focus:border-primary w-full rounded-xl border-2 border-transparent bg-gray-100 px-4 py-3 transition-all focus:bg-white focus:outline-none dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900 ${
						error ? 'border-red-500 dark:border-red-400' : ''
					}`, className)}
					{...props}
				/>
				{error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';

export default Input;
