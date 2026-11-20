'use client';

import { useState } from 'react';
import type { BookingWithDetails } from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import SourceSelect from '@/features/admin/components/SourceSelect';
import { useUpdateBookingSource } from '@/features/admin/hooks/useAdmin';
import { useTranslation } from '@/hooks/translation';

interface BookingSourceFormProps {
	booking: BookingWithDetails;
	onDone: () => void;
}

export default function BookingSourceForm({ booking, onDone }: BookingSourceFormProps) {
	const translate = useTranslation();
	const { mutate: updateSource, isPending } = useUpdateBookingSource();
	const [sourceId, setSourceId] = useState<string | null>(booking.sourceId ?? null);

	return (
		<form
			className="mt-2 space-y-3"
			onSubmit={(formEvent) => {
				formEvent.preventDefault();
				updateSource({ id: booking.id, data: { sourceId } }, { onSuccess: onDone });
			}}
		>
			<SourceSelect
				value={sourceId}
				onChange={setSourceId}
				label={translate('admin.bookingSource')}
				disabled={isPending}
			/>

			<div className="flex justify-end gap-2">
				<Button type="button" size="xs" variant="secondary" onClick={onDone} disabled={isPending}>
					{translate('admin.cancel')}
				</Button>
				<Button type="submit" size="xs" isLoading={isPending}>
					{translate('admin.saveChanges')}
				</Button>
			</div>
		</form>
	);
}
