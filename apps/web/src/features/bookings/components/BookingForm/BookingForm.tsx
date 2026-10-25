'use client';

import { useState } from 'react';
import { ModalHeader } from '@/components/ui/Modal';
import Link from 'next/link';
import Button from '@/components/ui/Buttons/Button';
import { localizePath } from '@/lib/i18n/config';
import Input from '@/components/ui/Inputs/Input';
import QuantitySelector from '../QuantitySelector';
import type { BookingFormProps } from './types';
import { useTranslation } from '@/hooks/translation';
import {
	getEventTranslation,
	PhoneSchema,
	quoteBooking,
	type EventOccurrence,
} from '@event-space/shared';
import { useFormatCurrency } from '@/hooks/format';
import { useFormatDate } from '@/hooks/format/useFormatDate';
import { useHasBookingForOccurrence } from '../../hooks/useBookings';
import { TimeZoneNote } from '@/components/shared/TimeZoneNote';
import { VerticalScroll } from '@/components/ui/VerticalScroll';

export default function BookingForm({
	event,
	initialQuantity,
	maxQuantity,
	onSubmit,
	onOccurrenceSelect,
	selectedOccurrence,
	isLoading,
	submitLabel,
	title,
	onClose,
	userPhone,
}: BookingFormProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const [quantity, setQuantity] = useState(initialQuantity);
	const [phone, setPhone] = useState(userPhone || '');
	const [phoneError, setPhoneError] = useState('');
	const formatCurrency = useFormatCurrency();
	const { formatDateTime } = useFormatDate();
	const { hasBooking: isOccurrenceBooked } = useHasBookingForOccurrence();

	// Filter and sort future occurrences
	const now = new Date();
	const futureOccurrences = (event.occurrences ?? [])
		.filter((o) => new Date(o.date) > now)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	const handleDecrement = () => setQuantity((q) => Math.max(1, q - 1));
	const handleIncrement = () => setQuantity((q) => Math.min(maxQuantity, q + 1));

	const handleOccurrenceSelect = (occurrence: EventOccurrence) => {
		const spotsLeft = occurrence.maxParticipants - occurrence.currentParticipants;
		if (spotsLeft > 0) {
			onOccurrenceSelect(occurrence);
			// Reset quantity if it exceeds new maxQuantity
			if (quantity > spotsLeft) {
				setQuantity(1);
			}
		}
	};

	const quote = quoteBooking(
		{ price: event.price, discountPercent: selectedOccurrence?.discountPercent },
		{ quantity },
	);
	const t = getEventTranslation(event, locale);
	const isPhoneValid = phone.trim() ? PhoneSchema.safeParse(phone.trim()).success : false;

	const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const nextPhone = event.target.value;
		setPhone(nextPhone);

		if (!nextPhone.trim()) {
			setPhoneError('');
			return;
		}

		setPhoneError(
			PhoneSchema.safeParse(nextPhone.trim()).success ? '' : translate('booking.invalidPhone'),
		);
	};

	const handleSubmitClick = () => {
		const trimmedPhone = phone.trim();
		if (!selectedOccurrence || !trimmedPhone || !PhoneSchema.safeParse(trimmedPhone).success) {
			setPhoneError(translate('booking.invalidPhone'));
			return;
		}

		setPhoneError('');
		onSubmit(quantity, trimmedPhone);
	};

	return (
		<div className="p-5 sm:p-6">
			<ModalHeader title={title} onClose={onClose} />

			<h3 className="font-bold text-gray-800 dark:text-white">{t.title}</h3>
			<p className="text-sm text-gray-500 dark:text-gray-400">{t.location}</p>

			{/* Occurrence Selector */}
			<div className="mt-6 space-y-2">
				<p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
					{translate('booking.selectDate')}
				</p>
				<TimeZoneNote />
				{futureOccurrences.length > 0 ? (
					<VerticalScroll
						className="max-h-[min(22rem,40vh)] pr-1"
						contentClassName="space-y-2 py-1"
					>
						{futureOccurrences.map((occurrence) => {
							const spotsLeft = occurrence.maxParticipants - occurrence.currentParticipants;
							const isSoldOut = spotsLeft <= 0;
							const isSelected = selectedOccurrence?.id === occurrence.id;
							const hasBooking = isOccurrenceBooked(occurrence.id);
							const occurrencePrice = quoteBooking(
								{ price: event.price, discountPercent: occurrence.discountPercent },
								{ quantity: 1 },
							);

							return (
								<button
									key={occurrence.id}
									onClick={() => handleOccurrenceSelect(occurrence)}
									disabled={isSoldOut || isLoading || hasBooking}
									className={`w-full rounded-xl border p-3 text-left transition-all ${
										isSelected
											? 'border-primary bg-primary/10 dark:bg-primary/20'
											: isSoldOut || hasBooking
												? 'cursor-not-allowed border-gray-200 opacity-50 dark:border-gray-700'
												: 'hover:border-primary dark:hover:border-primary cursor-pointer border-gray-200 dark:border-gray-700'
									}`}
								>
									<div className="flex items-center justify-between">
										<span className="text-sm font-medium text-gray-900 dark:text-white">
											{formatDateTime(occurrence.date)}
										</span>
										<span
											className={`text-xs ${isSoldOut ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
										>
											{isSoldOut
												? translate('booking.soldOut')
												: hasBooking
													? translate('booking.alreadyBooked')
													: `${spotsLeft} ${translate('booking.spotsLeft')}`}
										</span>
									</div>
									<div className="mt-1 flex items-baseline gap-2">
										<span className="text-primary text-sm font-bold">
											{formatCurrency(occurrencePrice.unitPrice)}
										</span>
										{occurrencePrice.discountPercent > 0 && (
											<>
												<span className="text-xs text-gray-400 line-through">
													{formatCurrency(occurrencePrice.baseUnitPrice)}
												</span>
												<span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-black text-white">
													{translate('event.discountOff', {
														percent: occurrencePrice.discountPercent,
													})}
												</span>
											</>
										)}
									</div>
								</button>
							);
						})}
					</VerticalScroll>
				) : (
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{translate('event.noUpcomingEvents')}
					</p>
				)}
			</div>

			{/* Quantity and Phone - shown only when occurrence is selected */}
			{selectedOccurrence && (
				<>
					<QuantitySelector
						quantity={quantity}
						maxQuantity={maxQuantity}
						onIncrement={handleIncrement}
						onDecrement={handleDecrement}
						disabled={isLoading}
						label={translate('booking.selectSpots')}
					/>

					<div className="mt-4">
						<Input
							label={translate('booking.phone')}
							type="tel"
							value={phone}
							onChange={handlePhoneChange}
							error={phoneError}
							required
						/>
					</div>

					<div className="mt-4 space-y-1">
						{quote.discountPercent > 0 && (
							<>
								<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
									<span>{translate('event.oldPrice')}</span>
									<span className="line-through">{formatCurrency(quote.baseTotal)}</span>
								</div>
								<div className="flex items-center justify-between text-sm font-semibold text-red-500">
									<span>
										{translate('event.discountOff', { percent: quote.discountPercent })}
									</span>
									<span>{formatCurrency(quote.total - quote.baseTotal)}</span>
								</div>
							</>
						)}
						<div className="flex items-center justify-between">
							<span className="text-gray-600 dark:text-gray-400">
								{translate('booking.totalPrice')}
							</span>
							<span className="text-primary text-2xl font-bold">{formatCurrency(quote.total)}</span>
						</div>
					</div>
				</>
			)}

			<p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
				{translate('legal.agreeNote')
					.split(/(\{terms\}|\{privacy\})/)
					.map((part, index) => {
						if (part === '{terms}') {
							return (
								<Link
									key={index}
									href={localizePath('/terms', translate.locale)}
									className="text-primary hover:underline"
								>
									{translate('legal.termsLink')}
								</Link>
							);
						}
						if (part === '{privacy}') {
							return (
								<Link
									key={index}
									href={localizePath('/privacy', translate.locale)}
									className="text-primary hover:underline"
								>
									{translate('legal.privacyLink')}
								</Link>
							);
						}
						return <span key={index}>{part}</span>;
					})}
			</p>

			<div className="mt-4 flex gap-3">
				<Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
					{translate('booking.cancel')}
				</Button>
				<Button
					variant="primary"
					onClick={handleSubmitClick}
					isLoading={isLoading}
					disabled={!selectedOccurrence || !isPhoneValid || isLoading}
					className="flex-1"
				>
					{submitLabel}
				</Button>
			</div>
		</div>
	);
}
