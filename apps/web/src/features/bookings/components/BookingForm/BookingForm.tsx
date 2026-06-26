'use client';

import { useState } from 'react';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import QuantitySelector from '../QuantitySelector';
import type { BookingFormProps } from './types';
import { useTranslation } from '@/hooks/translation';
import { getEventTranslation } from '@event-space/shared';
import { useFormatCurrency } from '@/hooks/format';

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
	const translate = useTranslation();
	const locale = translate.locale;
	const [quantity, setQuantity] = useState(initialQuantity);
	const totalPrice = event.price * quantity;
	const t = getEventTranslation(event, locale);

	const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
	const handleIncrement = () => setQuantity((q) => Math.min(maxQuantity, q + 1));

	const formatCurrency = useFormatCurrency()

	return (
		<div className="p-5 sm:p-6">
			<ModalHeader title={title} onClose={onClose} />

			<h3 className="font-bold text-gray-800 dark:text-white">{t.title}</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400">{t.location}</p>

			<QuantitySelector
				quantity={quantity}
				maxQuantity={maxQuantity}
				onIncrement={handleIncrement}
				onDecrement={handleDecrement}
				disabled={isLoading}
				label={translate('booking.selectSpots')}
			/>

			<div className="mt-4 flex items-center justify-between">
				<span className="text-gray-600 dark:text-gray-400">{translate('booking.totalPrice')}</span>
				<span className="text-primary text-2xl font-bold">{formatCurrency(totalPrice)}</span>
			</div>

			{availableSpots !== undefined && (
				<p className="mt-2 text-right text-sm text-gray-500 dark:text-gray-400">
					{availableSpots} {translate('booking.spotsAvailable')}
				</p>
			)}

			<div className="mt-6 flex gap-3">
				<Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
					{translate('booking.cancel')}
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
