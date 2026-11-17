'use client';

import { useState } from 'react';
import type { BookingWithDetails } from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import { useMarkBookingPaid } from '@/features/admin/hooks/useAdmin';
import { useFormatCurrency } from '@/hooks/format';
import { useTranslation } from '@/hooks/translation';

export default function MarkPaidControl({ booking }: { booking: BookingWithDetails }) {
	const translate = useTranslation();
	const formatCurrency = useFormatCurrency();
	const { mutate: markPaid, isPending } = useMarkBookingPaid();
	const [asking, setAsking] = useState(false);

	if (!asking) {
		return (
			<Button type="button" size="xs" variant="secondary" className="mt-2" onClick={() => setAsking(true)}>
				{translate('admin.markPaid')}
			</Button>
		);
	}

	return (
		<div className="mt-2 space-y-2">
			<p className="text-sm text-gray-600 dark:text-gray-300">
				{translate('admin.markPaidQuestion', { amount: formatCurrency(Number(booking.amount)) })}
			</p>
			<div className="flex gap-2">
				<Button type="button" size="xs" isLoading={isPending} onClick={() => markPaid(booking.id)}>
					{translate('admin.markPaidConfirm')}
				</Button>
				<Button type="button" size="xs" variant="secondary" disabled={isPending} onClick={() => setAsking(false)}>
					{translate('admin.cancel')}
				</Button>
			</div>
		</div>
	);
}
