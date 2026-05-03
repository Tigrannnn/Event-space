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
		<div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
			<span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
			<div className="flex items-center gap-3">
				<button
					onClick={onDecrement}
					disabled={quantity <= 1 || disabled}
					className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					<Minus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
				</button>
				<span className="w-6 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
				<button
					onClick={onIncrement}
					disabled={quantity >= maxQuantity || disabled}
					className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
				>
					<Plus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
				</button>
			</div>
		</div>
	);
}
