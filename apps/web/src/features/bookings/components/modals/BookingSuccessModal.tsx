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
import { useSkin } from '@/providers/BrandProvider';
import { cn } from '@/utils/cn';
import type { BrandSkin } from '@event-space/shared';
import { getEventTranslation } from '@event-space/shared';

export default function BookingSuccessModal() {
	const { closeModal } = useModalStore();
	const copyToClipboard = useCopyToClipboard();
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTimeZone } = useFormatDate();
	const formatCurrency = useFormatCurrency();
	const navigation = useLocalizedNavigation();
	const { data: user } = useCurrentUser();
	const skin = useSkin();
	const ui = SUCCESS_UI[skin];
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

				<div className={cn('flex flex-col items-center pt-6 text-center', ui.hero)}>
					<div className={ui.badge}>
						<Check className={ui.badgeIcon} strokeWidth={3} />
					</div>
					<div className={ui.heroText}>
						<h2 className={ui.title}>{translate('booking.successTitle')}</h2>
						<p className={ui.lead}>
							{translate('booking.successCongrats').replace('{event}', eventTranslation.title)}
						</p>
					</div>
				</div>

				<div className={ui.ref}>
					<p className={ui.refLabel}>{translate('booking.bookingRef')}</p>
					<div className={ui.refRow}>
						<span className={ui.refNumber}>{reference}</span>
						<button
							type="button"
							onClick={handleCopyReference}
							className="cursor-pointer rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
							title={translate('booking.refCopied')}
						>
							<Copy className="h-4 w-4" />
						</button>
					</div>
					<p className={ui.refTip}>{translate('booking.bookingRefTip')}</p>
				</div>

				{/* Booking details */}
				<div className={ui.grid}>
					<DetailRow
						skin={skin}
						icon={<Calendar className="h-4 w-4" />}
						label={translate('event.date')}
						value={occurrence ? formatDateTimeZone(occurrence.date) : '—'}
					/>
					<DetailRow
						skin={skin}
						icon={<Users className="h-4 w-4" />}
						label={translate('booking.quantity')}
						value={`${booking.quantity} ${
							booking.quantity === 1 ? translate('booking.spot') : translate('booking.spots')
						}`}
					/>
					<DetailRow
						skin={skin}
						icon={<Wallet className="h-4 w-4" />}
						label={translate('booking.paid')}
						value={formatCurrency(Number(booking.amount))}
					/>
					<DetailRow
						skin={skin}
						icon={<Wallet className="h-4 w-4" />}
						label={translate('booking.paymentMethod')}
						value={paymentMethodLabel}
					/>
					<DetailRow
						skin={skin}
						icon={<MapPin className="h-4 w-4" />}
						label={translate('event.location')}
						value={eventTranslation.location}
						href={event.locationUrl}
					/>
					<DetailRow
						skin={skin}
						icon={<Navigation className="h-4 w-4" />}
						label={translate('event.meetingLocationLabel')}
						value={eventTranslation.meetingLocation}
						href={event.meetingLocationUrl}
					/>
				</div>

				{eventTranslation.whatsIncluded?.length ? (
					<div className={ui.included}>
						<p className={ui.includedLabel}>{translate('event.whatsIncluded')}</p>
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
	skin: BrandSkin;
	icon: React.ReactNode;
	label: string;
	value: string;
	href?: string | null;
}

function DetailRow({ skin, icon, label, value, href }: DetailRowProps) {
	const row = DETAIL_UI[skin];
	const valueNode = href ? (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(row.value, 'hover:text-primary underline underline-offset-2 transition-colors')}
		>
			{value}
		</a>
	) : (
		<p className={row.value}>{value}</p>
	);

	if (skin === 'listing') {
		return (
			<div className={row.box}>
				<span className={row.icon}>{icon}</span>
				<div className="min-w-0">
					<p className={row.label}>{label}</p>
					{valueNode}
				</div>
			</div>
		);
	}

	if (skin === 'minimal') {
		return (
			<div className={row.box}>
				<span className={row.label}>{label}</span>
				{valueNode}
			</div>
		);
	}

	return (
		<div className={row.box}>
			<div className={row.head}>
				<span className={row.icon}>{icon}</span>
				<span className={row.label}>{label}</span>
			</div>
			{valueNode}
		</div>
	);
}

interface SuccessUi {
	hero: string;
	badge: string;
	badgeIcon: string;
	heroText: string;
	title: string;
	lead: string;
	ref: string;
	refLabel: string;
	refRow: string;
	refNumber: string;
	refTip: string;
	grid: string;
	included: string;
	includedLabel: string;
}

const SUCCESS_UI: Record<BrandSkin, SuccessUi> = {
	classic: {
		hero: '',
		badge:
			'mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40',
		badgeIcon: 'h-8 w-8 text-green-600 dark:text-green-400',
		heroText: '',
		title: 'text-primary text-2xl font-black sm:text-3xl',
		lead: 'mt-2 max-w-md text-[15px] text-gray-500 sm:text-sm dark:text-gray-400',
		ref: 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10 mt-6 rounded-3xl border p-5 text-center',
		refLabel: 'text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400',
		refRow: 'mt-2 flex items-center justify-center gap-2',
		refNumber: 'text-primary font-mono text-3xl font-bold',
		refTip: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
		grid: 'mt-4 grid gap-3 sm:grid-cols-2',
		included:
			'mt-4 rounded-3xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950',
		includedLabel: 'text-xs font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400',
	},
	minimal: {
		hero: 'items-start pt-8 text-left sm:pr-10',
		badge:
			'mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-900 dark:border-white',
		badgeIcon: 'h-5 w-5 text-gray-900 dark:text-white',
		heroText: '',
		title: 'text-2xl font-semibold tracking-tight text-gray-900 dark:text-white',
		lead: 'mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400',
		ref: 'mt-6 border-y border-gray-200 py-4 text-left dark:border-neutral-800',
		refLabel: 'text-[11px] font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400',
		refRow: 'mt-1 flex items-center justify-between gap-2',
		refNumber: 'font-mono text-2xl font-semibold tracking-tight text-gray-900 dark:text-white',
		refTip: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
		grid: 'mt-2 grid divide-y divide-gray-200 dark:divide-neutral-800',
		included: 'mt-4 border-t border-gray-200 pt-4 dark:border-neutral-800',
		includedLabel:
			'text-[11px] font-medium tracking-widest text-gray-500 uppercase dark:text-gray-400',
	},
	listing: {
		hero: 'mt-4 flex-row items-start gap-4 pt-0 text-left sm:pr-10',
		badge: 'flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-green-600',
		badgeIcon: 'h-6 w-6 text-white',
		heroText: '',
		title: 'text-xl font-bold text-gray-900 sm:text-2xl dark:text-white',
		lead: 'mt-1 text-sm text-gray-600 dark:text-gray-300',
		ref: 'bg-primary/5 border-primary/40 mt-5 rounded-md border border-dashed p-4 text-left',
		refLabel: 'text-xs font-bold text-gray-700 dark:text-gray-300',
		refRow: 'mt-1 flex items-center justify-between gap-2',
		refNumber: 'text-primary font-mono text-2xl font-bold',
		refTip: 'mt-1 text-xs text-gray-600 dark:text-gray-400',
		grid: 'mt-4 grid gap-2 sm:grid-cols-2',
		included: 'mt-4 rounded-md border border-gray-300 p-4 dark:border-neutral-700',
		includedLabel: 'text-sm font-bold text-gray-900 dark:text-white',
	},
	soft: {
		hero: '',
		badge:
			'from-primary to-accent mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br shadow-lg ring-8 ring-white dark:ring-gray-800',
		badgeIcon: 'h-9 w-9 text-white',
		heroText: '',
		title: 'text-primary font-(family-name:--font-display) text-3xl font-semibold',
		lead: 'mt-2 max-w-md text-[15px] text-gray-500 sm:text-sm dark:text-gray-400',
		ref: 'from-primary/10 to-accent/10 mt-6 rounded-[1.75rem] bg-linear-to-br p-5 text-center ring-1 ring-black/5 dark:ring-white/10',
		refLabel: 'text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400',
		refRow: 'mt-2 flex items-center justify-center gap-2',
		refNumber: 'text-primary font-(family-name:--font-display) text-3xl font-semibold tracking-wider',
		refTip: 'mt-1 text-xs text-gray-500 dark:text-gray-400',
		grid: 'mt-4 grid gap-3 sm:grid-cols-2',
		included:
			'mt-4 rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10',
		includedLabel: 'text-primary font-(family-name:--font-display) text-base font-semibold',
	},
};

interface DetailUi {
	box: string;
	head: string;
	icon: string;
	label: string;
	value: string;
}

const DETAIL_UI: Record<BrandSkin, DetailUi> = {
	classic: {
		box: 'rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900',
		head: 'flex items-center gap-2 text-gray-500 dark:text-gray-400',
		icon: 'flex',
		label: 'text-xs font-medium tracking-widest uppercase',
		value: 'mt-1 block font-medium text-gray-900 dark:text-white',
	},
	minimal: {
		box: 'flex items-baseline justify-between gap-6 py-3',
		head: '',
		icon: '',
		label: 'shrink-0 text-sm text-gray-500 dark:text-gray-400',
		value: 'text-right text-sm font-medium text-gray-900 dark:text-white',
	},
	listing: {
		box: 'flex items-start gap-3 rounded-md border border-gray-300 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900',
		head: '',
		icon: 'text-primary bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
		label: 'text-xs text-gray-600 dark:text-gray-400',
		value: 'text-sm font-bold text-gray-900 dark:text-white',
	},
	soft: {
		box: 'rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10',
		head: 'flex items-center gap-2 text-gray-500 dark:text-gray-400',
		icon: 'text-primary bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full',
		label: 'text-xs font-medium',
		value:
			'mt-2 block font-(family-name:--font-display) text-base font-semibold text-gray-900 dark:text-white',
	},
};
