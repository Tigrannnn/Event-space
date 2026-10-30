import type { Event, EventOccurrence } from '@event-space/shared';

export interface GuestDetails {
	name: string;
	email: string;
}

export interface BookingFormProps {
	event: Event;
	initialQuantity: number;
	maxQuantity: number;
	onSubmit: (quantity: number, phone: string, promoCode?: string, guest?: GuestDetails) => void;
	onOccurrenceSelect: (occurrence: EventOccurrence) => void;
	selectedOccurrence: EventOccurrence | null;
	isLoading: boolean;
	submitLabel: string;
	title: string;
	onClose: () => void;
	availableSpots?: number;
	userPhone?: string;
	/** Someone with no account: the form also asks for a name and an email. */
	isGuest?: boolean;
}