'use client';

import { useState } from 'react';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import QuantitySelector from '../QuantitySelector';
import type { BookingFormProps } from './types';

export default function BookingForm({
	event,
	initialQuantity,
	maxQuantity,
	onSubmit,
	isLoading,
	submitLabel,
	title,
	onClose,
	availableSpots,
}: BookingFormProps) {
	const [quantity, setQuantity] = useState(initialQuantity);
	const totalPrice = event.price * quantity;

	const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
	const handleIncrement = () => setQuantity((q) => Math.min(maxQuantity, q + 1));

	return (
		<div className="p-5 sm:p-6">
			<ModalHeader title={title} onClose={onClose} />

			<h3 className="font-bold text-gray-800 dark:text-white">{event.title}</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400">{event.location}</p>

			<QuantitySelector
				quantity={quantity}
				maxQuantity={maxQuantity}
				onIncrement={handleIncrement}
				onDecrement={handleDecrement}
				disabled={isLoading}
				label="Select spots"
			/>

			<div className="mt-4 flex items-center justify-between">
				<span className="text-gray-600 dark:text-gray-400">Total price</span>
				<span className="text-primary text-2xl font-bold">${totalPrice}</span>
			</div>

			{availableSpots !== undefined && (
				<p className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
					{availableSpots} spots available
				</p>
			)}

			<div className="mt-6 flex gap-3">
				<Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={() => onSubmit(quantity)}
					isLoading={isLoading}
					className="flex-1"
				>
					{submitLabel}
				</Button>
			</div>
		</div>
	);
}
