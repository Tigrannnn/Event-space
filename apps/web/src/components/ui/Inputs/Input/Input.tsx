import { cn } from '@/utils/cn';
import { forwardRef } from 'react';
import { useClassicLook } from '@/components/ui/ClassicLook/ClassicLook';

const MARKET_INPUT = 'in-data-[skin=market]:border in-data-[skin=market]:bg-white in-data-[skin=market]:border-gray-300 in-data-[skin=market]:dark:bg-neutral-950';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, className, ...props }, ref) => {
		const classic = useClassicLook();

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
					className={cn(`focus:border-primary w-full rounded-xl in-data-[skin=soft]:rounded-2xl in-data-[skin=soft]:border-gray-200 in-data-[skin=soft]:bg-white border-2 border-transparent bg-gray-100 px-4 py-3 transition-all focus:bg-white focus:outline-none dark:bg-gray-800 dark:text-white dark:focus:bg-gray-900 in-data-[skin=minimal]:border in-data-[skin=listing]:border in-data-[skin=minimal]:bg-white in-data-[skin=listing]:bg-white in-data-[skin=minimal]:focus:border-gray-900 in-data-[skin=listing]:focus:border-gray-900 in-data-[skin=minimal]:dark:bg-neutral-950 in-data-[skin=listing]:dark:bg-neutral-950 in-data-[skin=minimal]:dark:focus:border-gray-300 in-data-[skin=listing]:dark:focus:border-gray-300 ${
						error
							? 'border-red-500 dark:border-red-400'
							: 'in-data-[skin=minimal]:border-gray-300 in-data-[skin=listing]:border-gray-300 in-data-[skin=minimal]:dark:border-neutral-700 in-data-[skin=listing]:dark:border-neutral-700'
					}`, !classic && MARKET_INPUT, className)}
					{...props}
				/>
				{error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';

export default Input;
