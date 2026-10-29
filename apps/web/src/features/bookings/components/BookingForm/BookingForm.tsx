'use client';

import { useRef, useState } from 'react';
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
import { useHasBookingForOccurrence, usePromoCodeQuote } from '../../hooks/useBookings';
import { TimeZoneNote } from '@/components/shared/TimeZoneNote';
import { VerticalScroll } from '@/components/ui/VerticalScroll';
import { OccurrencePrice } from '../OccurrencePrice';
import { OccurrenceChips } from '../OccurrencePicker/OccurrenceChips';
import { OccurrenceRows } from '../OccurrencePicker/OccurrenceRows';
import { useSkin } from '@/providers/BrandProvider';
import { FlashValue } from '@/components/ui/FlashValue';
import { useApiError } from '@/hooks/apiError';

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
	const [promoCodeInput, setPromoCodeInput] = useState('');
	const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
	const formatCurrency = useFormatCurrency();
	const { formatDateTime } = useFormatDate();
	const { hasBooking: isOccurrenceBooked } = useHasBookingForOccurrence();
	const skin = useSkin();
	const isMinimal = skin === 'minimal';
	const isListing = skin === 'listing';
	const isMarket = skin === 'market';
	const DatePicker = isListing ? OccurrenceRows : OccurrenceChips;
	const selectedRef = useRef<HTMLButtonElement>(null);
	const apiError = useApiError();
	const promoQuote = usePromoCodeQuote(selectedOccurrence?.id, quantity, appliedPromoCode);

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

	const baseQuote = quoteBooking(
		{ price: event.price, discountPercent: selectedOccurrence?.discountPercent },
		{ quantity },
	);
	// The server has the final word on price once a code is applied — it alone knows whether
	// the code actually beats the tour's own discount, so the preview must match it exactly.
	const quote = promoQuote.data
		? {
				...baseQuote,
				total: promoQuote.data.amount,
				baseTotal: promoQuote.data.baseAmount,
				discountPercent: promoQuote.data.discountPercent,
			}
		: baseQuote;
	const t = getEventTranslation(event, locale);
	const isPhoneValid = phone.trim() ? PhoneSchema.safeParse(phone.trim()).success : false;

	const handleApplyPromoCode = () => {
		const trimmed = promoCodeInput.trim();
		if (trimmed) setAppliedPromoCode(trimmed);
	};

	const handleRemovePromoCode = () => {
		setAppliedPromoCode(null);
		setPromoCodeInput('');
	};

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
		onSubmit(quantity, trimmedPhone, promoQuote.isSuccess ? (appliedPromoCode ?? undefined) : undefined);
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
				{futureOccurrences.length > 0 && (isMinimal || isListing || isMarket) ? (
					<DatePicker
						occurrences={futureOccurrences}
						selectedId={selectedOccurrence?.id}
						onSelect={(id) => {
							const chosen = futureOccurrences.find((occurrence) => occurrence.id === id);
							if (chosen) handleOccurrenceSelect(chosen);
						}}
						price={event.price}
						isBooked={isOccurrenceBooked}
						disabled={isLoading}
						disableBooked
					/>
				) : futureOccurrences.length > 0 ? (
					<VerticalScroll
						className="max-h-[min(22rem,40vh)] pr-1"
						contentClassName="space-y-2 py-1"
						scrollToRef={selectedRef}
					>
						{futureOccurrences.map((occurrence) => {
							const spotsLeft = occurrence.maxParticipants - occurrence.currentParticipants;
							const isSoldOut = spotsLeft <= 0;
							const isSelected = selectedOccurrence?.id === occurrence.id;
							const hasBooking = isOccurrenceBooked(occurrence.id);

							return (
								<button
									key={occurrence.id}
									ref={isSelected ? selectedRef : undefined}
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
										<FlashValue
											watch={isSoldOut ? 'sold-out' : spotsLeft}
											className={`text-xs ${isSoldOut ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
										>
											{isSoldOut
												? translate('booking.soldOut')
												: hasBooking
													? translate('booking.alreadyBooked')
													: `${spotsLeft} ${translate('booking.spotsLeft')}`}
										</FlashValue>
									</div>
									<OccurrencePrice
										price={event.price}
										discountPercent={occurrence.discountPercent}
										className="mt-1"
									/>
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

					<div className="mt-4">
						{appliedPromoCode ? (
							<div className="space-y-1">
								<div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
									<span className="text-sm text-gray-700 dark:text-gray-200">
										{promoQuote.isLoading
											? `${appliedPromoCode}…`
											: promoQuote.isSuccess
												? translate('booking.promoCodeApplied', { code: promoQuote.data.code })
												: appliedPromoCode}
									</span>
									<button
										type="button"
										onClick={handleRemovePromoCode}
										aria-label={translate('booking.promoCodeRemove')}
										className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
									>
										✕
									</button>
								</div>
								{promoQuote.isError && (
									<p className="text-xs text-red-500">{apiError(promoQuote.error)}</p>
								)}
								{promoQuote.isSuccess &&
									promoQuote.data.discountPercent !== promoQuote.data.promoCodeDiscountPercent && (
										<p className="text-xs text-amber-600 dark:text-amber-400">
											{translate('booking.promoCodeNotBetter', {
												percent: promoQuote.data.discountPercent,
											})}
										</p>
									)}
							</div>
						) : (
							<div className="flex items-end gap-2">
								<div className="flex-1">
									<Input
										label={translate('booking.promoCode')}
										value={promoCodeInput}
										onChange={(event) => setPromoCodeInput(event.target.value)}
									/>
								</div>
								<Button
									type="button"
									variant="secondary"
									onClick={handleApplyPromoCode}
									disabled={!promoCodeInput.trim()}
								>
									{translate('booking.promoCodeApply')}
								</Button>
							</div>
						)}
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
