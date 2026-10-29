import { Minus, Plus } from 'lucide-react';
import { QuantitySelectorProps } from './types';

export default function QuantitySelector({
	quantity,
	maxQuantity,
	onIncrement,
	onDecrement,
	disabled = false,
	label = 'Number of spots',
}: QuantitySelectorProps) {
	return (
		<div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50 in-data-[skin=minimal]:rounded-none in-data-[skin=minimal]:border-y in-data-[skin=minimal]:border-gray-200 in-data-[skin=minimal]:bg-transparent in-data-[skin=minimal]:px-0 in-data-[skin=minimal]:dark:border-neutral-800 in-data-[skin=minimal]:dark:bg-transparent in-data-[skin=listing]:rounded-md in-data-[skin=listing]:border in-data-[skin=listing]:border-gray-300 in-data-[skin=listing]:bg-white in-data-[skin=listing]:dark:border-neutral-700 in-data-[skin=listing]:dark:bg-neutral-900 in-data-[skin=soft]:rounded-2xl in-data-[skin=soft]:border in-data-[skin=soft]:border-gray-200 in-data-[skin=soft]:bg-white in-data-[skin=soft]:shadow-sm in-data-[skin=soft]:dark:border-gray-700 in-data-[skin=soft]:dark:bg-gray-800 in-data-[skin=market]:rounded-xl in-data-[skin=market]:border in-data-[skin=market]:border-gray-200 in-data-[skin=market]:bg-white in-data-[skin=market]:dark:border-neutral-700 in-data-[skin=market]:dark:bg-neutral-900 in-data-[skin=drawer]:rounded-2xl in-data-[skin=drawer]:border in-data-[skin=drawer]:border-gray-200 in-data-[skin=drawer]:bg-white in-data-[skin=drawer]:dark:border-neutral-700 in-data-[skin=drawer]:dark:bg-neutral-900">
			<span className="font-medium text-gray-700 dark:text-gray-300 in-data-[skin=minimal]:text-gray-900 in-data-[skin=minimal]:dark:text-white in-data-[skin=listing]:font-semibold in-data-[skin=listing]:text-gray-900 in-data-[skin=listing]:dark:text-white in-data-[skin=soft]:font-semibold in-data-[skin=soft]:text-gray-900 in-data-[skin=soft]:dark:text-white in-data-[skin=market]:font-semibold in-data-[skin=market]:text-gray-900 in-data-[skin=market]:dark:text-white">{label}</span>
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onDecrement}
					disabled={quantity <= 1 || disabled}
					className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 in-data-[skin=minimal]:size-9 in-data-[skin=minimal]:border-gray-400 in-data-[skin=minimal]:hover:border-gray-900 in-data-[skin=minimal]:hover:bg-white in-data-[skin=minimal]:dark:border-neutral-600 in-data-[skin=minimal]:dark:bg-transparent in-data-[skin=listing]:size-9 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:border-primary in-data-[skin=listing]:hover:bg-primary/10 in-data-[skin=listing]:dark:bg-transparent in-data-[skin=soft]:size-9 in-data-[skin=soft]:border-primary in-data-[skin=soft]:hover:bg-primary/10 in-data-[skin=soft]:dark:bg-transparent in-data-[skin=soft]:dark:hover:bg-primary/20 in-data-[skin=market]:size-9 in-data-[skin=market]:rounded-lg in-data-[skin=market]:border-primary in-data-[skin=market]:hover:bg-primary/10 in-data-[skin=market]:dark:bg-transparent in-data-[skin=drawer]:size-9 in-data-[skin=drawer]:border-primary in-data-[skin=drawer]:hover:bg-primary/10 in-data-[skin=drawer]:dark:bg-transparent"
				>
					<Minus className="h-4 w-4 text-gray-700 dark:text-gray-300 in-data-[skin=listing]:text-primary in-data-[skin=soft]:text-primary in-data-[skin=market]:text-primary in-data-[skin=drawer]:text-primary" />
				</button>
				<span className="w-6 text-center font-bold text-gray-900 dark:text-white in-data-[skin=minimal]:w-8 in-data-[skin=minimal]:font-semibold in-data-[skin=listing]:w-8 in-data-[skin=listing]:text-lg in-data-[skin=soft]:w-8 in-data-[skin=soft]:font-(family-name:--font-display) in-data-[skin=soft]:text-xl">{quantity}</span>
				<button
					type="button"
					onClick={onIncrement}
					disabled={quantity >= maxQuantity || disabled}
					className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 in-data-[skin=minimal]:size-9 in-data-[skin=minimal]:border-gray-400 in-data-[skin=minimal]:hover:border-gray-900 in-data-[skin=minimal]:hover:bg-white in-data-[skin=minimal]:dark:border-neutral-600 in-data-[skin=minimal]:dark:bg-transparent in-data-[skin=listing]:size-9 in-data-[skin=listing]:rounded-md in-data-[skin=listing]:border-primary in-data-[skin=listing]:hover:bg-primary/10 in-data-[skin=listing]:dark:bg-transparent in-data-[skin=soft]:size-9 in-data-[skin=soft]:border-primary in-data-[skin=soft]:hover:bg-primary/10 in-data-[skin=soft]:dark:bg-transparent in-data-[skin=soft]:dark:hover:bg-primary/20 in-data-[skin=market]:size-9 in-data-[skin=market]:rounded-lg in-data-[skin=market]:border-primary in-data-[skin=market]:hover:bg-primary/10 in-data-[skin=market]:dark:bg-transparent in-data-[skin=drawer]:size-9 in-data-[skin=drawer]:border-primary in-data-[skin=drawer]:hover:bg-primary/10 in-data-[skin=drawer]:dark:bg-transparent"
				>
					<Plus className="h-4 w-4 text-gray-700 dark:text-gray-300 in-data-[skin=listing]:text-primary in-data-[skin=soft]:text-primary in-data-[skin=market]:text-primary in-data-[skin=drawer]:text-primary" />
				</button>
			</div>
		</div>
	);
}
