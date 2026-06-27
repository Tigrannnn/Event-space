import type { Event } from '@event-space/shared';

export interface BookingFormProps {
	event: Event;
	initialQuantity: number;
	maxQuantity: number;
	onSubmit: (quantity: number, phone: string) => void;
	isLoading: boolean;
	submitLabel: string;
	title: string;
	onClose: () => void;
	availableSpots?: number;
	userPhone?: string;
}