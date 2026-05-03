import { Booking, Event } from '@event-space/shared';

export interface BookingWithEvent extends Booking {
	event?: Event;
}

export interface BookingCardProps {
	booking: BookingWithEvent;
}
