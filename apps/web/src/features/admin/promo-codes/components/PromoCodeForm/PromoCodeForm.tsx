'use client';

import { useState } from 'react';
import { ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Buttons/Button';
import Input from '@/components/ui/Inputs/Input';
import { useTranslation } from '@/hooks/translation';
import type { CreatePromoCodeData, PromoCode } from '@event-space/shared';

interface PromoCodeFormProps {
	promoCode?: PromoCode;
	isPending: boolean;
	submitLabel: string;
	onCancel: () => void;
	onSubmit: (data: CreatePromoCodeData) => void;
}

/** `type="date"` inputs hand back `''` when cleared — that must become "omit this field",
 *  not a string the API's date parser will choke on. */
function dateInputValue(value: string | Date | null | undefined): string {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

export default function PromoCodeForm({
	promoCode,
	isPending,
	submitLabel,
	onCancel,
	onSubmit,
}: PromoCodeFormProps) {
	const translate = useTranslation();

	const [code, setCode] = useState(promoCode?.code ?? '');
	const [discountPercent, setDiscountPercent] = useState(String(promoCode?.discountPercent ?? ''));
	const [maxUses, setMaxUses] = useState(promoCode?.maxUses != null ? String(promoCode.maxUses) : '');
	const [maxUsesPerUser, setMaxUsesPerUser] = useState(
		promoCode?.maxUsesPerUser != null ? String(promoCode.maxUsesPerUser) : '',
	);
	const [validFrom, setValidFrom] = useState(dateInputValue(promoCode?.validFrom));
	const [validUntil, setValidUntil] = useState(dateInputValue(promoCode?.validUntil));
	const [active, setActive] = useState(promoCode?.active ?? true);
	const [note, setNote] = useState(promoCode?.note ?? '');

	const percent = Number(discountPercent);
	const isValid =
		code.trim().length >= 3 && Number.isInteger(percent) && percent >= 1 && percent <= 100;

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!isValid) return;

		onSubmit({
			code: code.trim(),
			discountPercent: percent,
			maxUses: maxUses.trim() ? Number(maxUses) : undefined,
			maxUsesPerUser: maxUsesPerUser.trim() ? Number(maxUsesPerUser) : undefined,
			validFrom: validFrom || undefined,
			validUntil: validUntil || undefined,
			active,
			note: note.trim() || undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="p-5 sm:p-6">
			<ModalHeader
				title={promoCode ? translate('admin.updatePromoCodeModal') : translate('admin.createPromoCodeModal')}
				onClose={onCancel}
			/>

			<div className="mt-4 space-y-4">
				<Input
					label={translate('admin.promoCodeCode')}
					value={code}
					onChange={(event) => setCode(event.target.value.toUpperCase())}
					placeholder="SUMMER10"
					required
				/>

				<Input
					label={translate('admin.promoCodeDiscountPercent')}
					type="number"
					min={1}
					max={100}
					value={discountPercent}
					onChange={(event) => setDiscountPercent(event.target.value)}
					required
				/>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label={translate('admin.promoCodeMaxUses')}
						type="number"
						min={1}
						value={maxUses}
						onChange={(event) => setMaxUses(event.target.value)}
						placeholder={translate('admin.promoCodeUnlimited')}
					/>
					<Input
						label={translate('admin.promoCodeMaxUsesPerUser')}
						type="number"
						min={1}
						value={maxUsesPerUser}
						onChange={(event) => setMaxUsesPerUser(event.target.value)}
						placeholder={translate('admin.promoCodeUnlimited')}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<Input
						label={translate('admin.promoCodeValidFrom')}
						type="date"
						value={validFrom}
						onChange={(event) => setValidFrom(event.target.value)}
					/>
					<Input
						label={translate('admin.promoCodeValidUntil')}
						type="date"
						value={validUntil}
						onChange={(event) => setValidUntil(event.target.value)}
					/>
				</div>

				<Input
					label={translate('admin.promoCodeNote')}
					value={note}
					onChange={(event) => setNote(event.target.value)}
				/>

				<label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
					<input
						type="checkbox"
						checked={active}
						onChange={(event) => setActive(event.target.checked)}
						className="h-4 w-4"
					/>
					{translate('admin.active')}
				</label>
			</div>

			<div className="mt-6 flex gap-3">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isPending} className="flex-1">
					{translate('booking.cancel')}
				</Button>
				<Button type="submit" variant="primary" isLoading={isPending} disabled={!isValid || isPending} className="flex-1">
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
