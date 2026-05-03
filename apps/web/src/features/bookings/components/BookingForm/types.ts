import type { Event } from '@event-space/shared';

export interface BookingFormProps {
	event: Event;
	initialQuantity: number;
	maxQuantity: number;
	onSubmit: (quantity: number) => void;
	isLoading: boolean;
	submitLabel: string;
	title: string;
	onClose: () => void;
	availableSpots?: number;
}