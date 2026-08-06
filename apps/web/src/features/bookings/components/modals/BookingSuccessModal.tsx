'use client';

import { Calendar, Check, Copy, Mail, MapPin, Navigation, Users, Wallet } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import ModalCloseButton from '@/components/ui/Buttons/ModalCloseButton';
import Button from '@/components/ui/Buttons/Button';
import { ModalType, useModalData, useModalStore } from '@/stores/modalStore';
import { useCopyToClipboard } from '@/hooks/clipboard';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { formatBookingReference } from '@/utils/booking';
import { useCurrentUser } from '@/features/users';
import { getEventTranslation } from '@event-space/shared';

export default function BookingSuccessModal() {
	const { closeModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const navigation = useLocalizedNavigation();
	const { data: user } = useCurrentUser();
	const modalData = useModalData(ModalType.BookingSuccess);

	if (!modalData) {
		return null;
	}

	const { booking, event, occurrence } = modalData;
	const eventTranslation = getEventTranslation(event, locale);
	const reference = formatBookingReference(booking.referenceNumber);

	const paymentMethodLabel = {
		SITE_PAYMENT: translate('booking.paymentMethodSite'),
		OFFLINE_PAID: translate('booking.paymentMethodOffline'),
		PAY_ON_ARRIVAL: translate('booking.paymentMethodOnArrival'),
	}[booking.paymentMethod];

	const handleCopyReference = async () => {
		await copyToClipboard(reference, 'booking.refCopied', 'event.copyFailed');
	};

	const handleViewBookings = () => {
		navigation.push('/bookings');
		closeModal();
	};

	return (
		<Modal onClose={closeModal} size="lg" ariaLabel={translate('booking.successTitle')}>
			<div className="relative p-5 sm:p-6">
				<div className="absolute top-5 right-5 sm:top-6 sm:right-6">
					<ModalCloseButton onClick={closeModal} aria-label={translate('booking.close')} />
				</div>

				{/* Celebration hero */}
				<div className="flex flex-col items-center pt-6 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
						<Check className="h-8 w-8 text-green-600 dark:text-green-400" strokeWidth={3} />
					</div>
					<h2 className="text-primary text-2xl font-black sm:text-3xl">
						{translate('booking.successTitle')}
					</h2>
					<p className="mt-2 max-w-md text-[15px] text-gray-500 sm:text-sm dark:text-gray-400">
						{translate('booking.successCongrats').replace('{event}', eventTranslation.title)}
					</p>
				</div>

				{/* Booking reference — the thing the user actually needs to keep */}
				<div className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 mt-6 rounded-3xl border p-5 text-center">
					<p className="text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
						{translate('booking.bookingRef')}
					</p>
					<div className="mt-2 flex items-center justify-center gap-2">
						<span className="text-primary font-mono text-3xl font-bold">{reference}</span>
						<button
							type="button"
							onClick={handleCopyReference}
							className="cursor-pointer rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
							title={translate('booking.refCopied')}
						>
							<Copy className="h-4 w-4" />
						</button>
					</div>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						{translate('booking.bookingRefTip')}
					</p>
				</div>

				{/* Booking details */}
				<div className="mt-4 grid gap-3 sm:grid-cols-2">
					<DetailRow
						icon={<Calendar className="h-4 w-4" />}
						label={translate('event.date')}
						value={occurrence ? formatDateTime(occurrence.date) : '—'}
					/>
					<DetailRow
						icon={<Users className="h-4 w-4" />}
						label={translate('booking.quantity')}
						value={`${booking.quantity} ${
							booking.quantity === 1 ? translate('booking.spot') : translate('booking.spots')
						}`}
					/>
					<DetailRow
						icon={<Wallet className="h-4 w-4" />}
						label={translate('booking.paid')}
						value={formatCurrency(Number(booking.amount))}
					/>
					<DetailRow
						icon={<Wallet className="h-4 w-4" />}
						label={translate('booking.paymentMethod')}
						value={paymentMethodLabel}
					/>
					<DetailRow
						icon={<MapPin className="h-4 w-4" />}
						label={translate('event.location')}
						value={eventTranslation.location}
						href={event.locationUrl}
					/>
					<DetailRow
						icon={<Navigation className="h-4 w-4" />}
						label={translate('event.meetingLocationLabel')}
						value={eventTranslation.meetingLocation}
						href={event.meetingLocationUrl}
					/>
				</div>

				{eventTranslation.whatsIncluded?.length ? (
					<div className="mt-4 rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
						<p className="text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400">
							{translate('event.whatsIncluded')}
						</p>
						<ul className="mt-2 grid gap-1.5 text-sm text-gray-700 sm:grid-cols-2 dark:text-gray-200">
							{eventTranslation.whatsIncluded.map((item) => (
								<li key={item} className="flex items-start gap-2">
									<Check className="text-primary mt-0.5 h-3.5 w-3.5 shrink-0" />
									<span>{item}</span>
								</li>
							))}
						</ul>
					</div>
				) : null}

				{user?.email && (
					<p className="mt-4 flex items-center justify-center gap-2 text-center text-sm text-gray-500 dark:text-gray-400">
						<Mail className="h-4 w-4 shrink-0" />
						{translate('booking.successEmailSent').replace('{email}', user.email)}
					</p>
				)}

				<div className="mt-6 flex flex-col gap-3 sm:flex-row">
					<Button variant="secondary" onClick={closeModal} className="flex-1">
						{translate('booking.close')}
					</Button>
					<Button variant="primary" onClick={handleViewBookings} className="flex-1">
						{translate('booking.viewMyBookings')}
					</Button>
				</div>
			</div>
		</Modal>
	);
}

interface DetailRowProps {
	icon: React.ReactNode;
	label: string;
	value: string;
	href?: string | null;
}

function DetailRow({ icon, label, value, href }: DetailRowProps) {
	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
			<div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
				{icon}
				<span className="text-xs font-medium tracking-widest uppercase">{label}</span>
			</div>
			{href ? (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="hover:text-primary mt-1 block font-medium text-gray-900 underline underline-offset-2 transition-colors dark:text-white"
				>
					{value}
				</a>
			) : (
				<p className="mt-1 font-medium text-gray-900 dark:text-white">{value}</p>
			)}
		</div>
	);
}
