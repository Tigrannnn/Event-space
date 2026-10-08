import { AuthAction } from '@event-space/shared';
import type { Locale, PaymentMethod } from '@prisma/client';

export const DEFAULT_LOCALE: Locale = 'ru';

export function pickLocale<T>(table: Record<Locale, T>, locale: Locale | undefined): T {
	return table[locale ?? DEFAULT_LOCALE] ?? table[DEFAULT_LOCALE];
}

interface VerificationStrings {
	subject: string;
	title: string;
	intro: (action: string) => string;
	expiry: string;
	ignoreNote: string;
	actions: Record<AuthAction, string>;
}

export const VERIFICATION_STRINGS: Record<Locale, VerificationStrings> = {
	en: {
		subject: 'Your verification code',
		title: 'Verify your email',
		intro: (action) => `Enter this code to ${action}:`,
		expiry: 'Expires in 15 minutes',
		ignoreNote: "If you didn't request this, you can safely ignore this email.",
		actions: {
			[AuthAction.REGISTER]: 'sign up',
			[AuthAction.LOGIN]: 'sign in',
			[AuthAction.RESET_PASSWORD]: 'reset your password',
		},
	},
	ru: {
		subject: 'Код подтверждения',
		title: 'Подтвердите почту',
		intro: (action) => `Введите этот код, чтобы ${action}:`,
		expiry: 'Код действует 15 минут',
		ignoreNote: 'Если вы не запрашивали код, просто не отвечайте на это письмо.',
		actions: {
			[AuthAction.REGISTER]: 'завершить регистрацию',
			[AuthAction.LOGIN]: 'войти',
			[AuthAction.RESET_PASSWORD]: 'сменить пароль',
		},
	},
	hy: {
		subject: 'Հաստատման կոդ',
		title: 'Հաստատեք էլ. հասցեն',
		intro: (action) => `Մուտքագրեք այս կոդը՝ ${action}:`,
		expiry: 'Կոդը գործում է 15 րոպե',
		ignoreNote: 'Եթե Դուք կոդ չեք պահանջել, պարզապես անտեսեք այս նամակը։',
		actions: {
			[AuthAction.REGISTER]: 'գրանցումն ավարտելու համար',
			[AuthAction.LOGIN]: 'մուտք գործելու համար',
			[AuthAction.RESET_PASSWORD]: 'գաղտնաբառը փոխելու համար',
		},
	},
};

interface EventCancelledStrings {
	subject: (eventTitle: string) => string;
	title: string;
	greeting: (userName: string) => string;
	body: (eventTitle: string, eventDate: string) => string;
	reason: (reason: string) => string;
	refund: (amount: string) => string;
	support: string;
	signoff: string;
	signature: string;
}

export const EVENT_CANCELLED_STRINGS: Record<Locale, EventCancelledStrings> = {
	en: {
		subject: (eventTitle) => `Cancelled: ${eventTitle}`,
		title: 'Tour cancelled',
		greeting: (userName) => `Dear ${userName},`,
		body: (eventTitle, eventDate) =>
			`Unfortunately, "${eventTitle}" on ${eventDate} has been cancelled.`,
		reason: (reason) => `Reason: ${reason}`,
		refund: (amount) =>
			`A full refund of ${amount} is on its way back to the card you paid with. It usually takes 5–10 business days to appear.`,
		support: 'If you have any questions, just reply to this email.',
		signoff: 'Best regards,',
		signature: 'The Event Space Team',
	},
	ru: {
		subject: (eventTitle) => `Отменён: ${eventTitle}`,
		title: 'Тур отменён',
		greeting: (userName) => `Здравствуйте, ${userName}!`,
		body: (eventTitle, eventDate) => `К сожалению, тур «${eventTitle}» ${eventDate} отменён.`,
		reason: (reason) => `Причина: ${reason}`,
		refund: (amount) =>
			`Возврат ${amount} уже отправлен на карту, с которой была оплата. Обычно деньги приходят за 5–10 рабочих дней.`,
		support: 'Если остались вопросы — просто ответьте на это письмо.',
		signoff: 'С уважением,',
		signature: 'Команда Event Space',
	},
	hy: {
		subject: (eventTitle) => `Չեղարկված է՝ ${eventTitle}`,
		title: 'Տուրը չեղարկված է',
		greeting: (userName) => `Բարև Ձեզ, ${userName}:`,
		body: (eventTitle, eventDate) => `Ցավոք, «${eventTitle}» տուրը ${eventDate}-ին չեղարկվել է։`,
		reason: (reason) => `Պատճառը՝ ${reason}`,
		refund: (amount) =>
			`${amount} գումարը վերադարձվում է այն քարտին, որով վճարել եք։ Սովորաբար դա տևում է 5–10 աշխատանքային օր։`,
		support: 'Հարցեր ունենալու դեպքում պարզապես պատասխանեք այս նամակին։',
		signoff: 'Հարգանքով՝',
		signature: 'Event Space թիմ',
	},
};

interface BookingCancelledStrings {
	subject: (eventTitle: string) => string;
	title: string;
	greeting: (userName: string) => string;
	body: (eventTitle: string, eventDate: string, reference: string) => string;
	refund: (amount: string) => string;
	noRefund: string;
	nothingPaid: string;
	offlineRefund: string;
	refundPending: string;
	support: string;
	signoff: string;
}

export const BOOKING_CANCELLED_STRINGS: Record<Locale, BookingCancelledStrings> = {
	en: {
		subject: (eventTitle) => `Booking cancelled: ${eventTitle}`,
		title: 'Booking cancelled',
		greeting: (userName) => `Dear ${userName},`,
		body: (eventTitle, eventDate, reference) =>
			`Booking ${reference} for "${eventTitle}" on ${eventDate} has been cancelled at your request.`,
		refund: (amount) =>
			`A refund of ${amount} is on its way back to the card you paid with. It usually takes 5–10 business days to appear.`,
		noRefund: 'Under the cancellation terms for this tour, this cancellation is not refundable.',
		nothingPaid: 'Nothing was paid for this booking, so there is nothing to refund.',
		offlineRefund:
			'The payment you made in person is refunded by the company — reply to this email and we will arrange it.',
		refundPending:
			'The refund could not be processed automatically. We are looking into it and will get back to you.',
		support: 'If you cancelled by mistake, just reply to this email — we will sort it out.',
		signoff: 'Best regards,',
	},
	ru: {
		subject: (eventTitle) => `Бронь отменена: ${eventTitle}`,
		title: 'Бронь отменена',
		greeting: (userName) => `Здравствуйте, ${userName}!`,
		body: (eventTitle, eventDate, reference) =>
			`Бронь ${reference} на тур «${eventTitle}» ${eventDate} отменена по вашей просьбе.`,
		refund: (amount) =>
			`Возврат ${amount} отправлен на карту, с которой была оплата. Обычно деньги приходят за 5–10 рабочих дней.`,
		noRefund: 'По условиям отмены этого тура возврат не предусмотрен.',
		nothingPaid: 'Оплата по этой брони не проходила, возвращать нечего.',
		offlineRefund:
			'Оплату, внесённую на месте, возвращает компания — ответьте на это письмо, и мы всё оформим.',
		refundPending: 'Возврат не удалось провести автоматически. Мы разбираемся и свяжемся с вами.',
		support: 'Если отменили случайно — просто ответьте на это письмо, всё вернём.',
		signoff: 'С уважением,',
	},
	hy: {
		subject: (eventTitle) => `Ամրագրումը չեղարկված է՝ ${eventTitle}`,
		title: 'Ամրագրումը չեղարկված է',
		greeting: (userName) => `Բարև Ձեզ, ${userName}:`,
		body: (eventTitle, eventDate, reference) =>
			`${reference} ամրագրումը «${eventTitle}» տուրի համար ${eventDate}-ին չեղարկվել է Ձեր խնդրանքով։`,
		refund: (amount) =>
			`${amount} գումարը վերադարձվում է այն քարտին, որով վճարել եք։ Սովորաբար դա տևում է 5–10 աշխատանքային օր։`,
		noRefund: 'Այս տուրի չեղարկման պայմաններով գումարը չի վերադարձվում։',
		nothingPaid: 'Այս ամրագրման համար վճարում չի կատարվել, վերադարձնելու բան չկա։',
		offlineRefund:
			'Տեղում կատարված վճարումը վերադարձնում է ընկերությունը՝ պատասխանեք այս նամակին, և մենք կձևակերպենք։',
		refundPending: 'Վերադարձը չհաջողվեց կատարել ավտոմատ։ Մենք ճշտում ենք և կկապվենք Ձեզ հետ։',
		support: 'Եթե չեղարկել եք սխալմամբ, պարզապես պատասխանեք այս նամակին՝ կվերականգնենք։',
		signoff: 'Հարգանքով՝',
	},
};

interface BookingConfirmationStrings {
	subject: string;
	title: string;
	intro: string;
	reference: string;
	event: string;
	location: string;
	date: string;
	time: string;
	quantity: string;
	bookedBy: string;
	bookedAt: string;
	paymentMethod: string;
	amount: string;
	meetingPoint: string;
	openMap: string;
	included: string;
	cancellationTitle: string;
	cancellationRule: (hours: number, percent: number) => string;
	cancellationNone: string;
	bringCash: (amount: string) => string;
	outro: string;
	signature: string;
	paymentMethodLabels: Record<PaymentMethod, string>;
}

export const BOOKING_CONFIRMATION_STRINGS: Record<Locale, BookingConfirmationStrings> = {
	en: {
		subject: 'Your booking confirmation',
		title: 'Booking Confirmed',
		intro: 'Thank you for your booking! Here are the details:',
		reference: 'Reference',
		event: 'Event',
		location: 'Location',
		date: 'Date',
		time: 'Time',
		quantity: 'Quantity',
		bookedBy: 'Booked by',
		bookedAt: 'Booked on',
		paymentMethod: 'Payment method',
		amount: 'Amount',
		meetingPoint: 'Meeting point',
		openMap: 'Open in maps',
		included: "What's included",
		cancellationTitle: 'Cancellation',
		cancellationRule: (hours, percent) =>
			`More than ${hours} h before the start — ${percent}% refunded`,
		cancellationNone: 'Cancellation is not refundable.',
		bringCash: (amount) => `Payment on arrival: please bring ${amount}.`,
		outro: 'We look forward to seeing you there.',
		signature: 'The Event Space Team',
		paymentMethodLabels: {
			SITE_PAYMENT: 'Paid online',
			OFFLINE_PAID: 'Paid offline',
			PAY_ON_ARRIVAL: 'Pay on arrival',
		},
	},
	ru: {
		subject: 'Подтверждение бронирования',
		title: 'Бронирование подтверждено',
		intro: 'Спасибо за бронирование! Вот детали:',
		reference: 'Номер брони',
		event: 'Событие',
		location: 'Место проведения',
		date: 'Дата',
		time: 'Время',
		quantity: 'Количество мест',
		bookedBy: 'Кто бронировал',
		bookedAt: 'Дата брони',
		paymentMethod: 'Способ оплаты',
		amount: 'Сумма',
		meetingPoint: 'Место сбора',
		openMap: 'Открыть на карте',
		included: 'Что входит',
		cancellationTitle: 'Отмена брони',
		cancellationRule: (hours, percent) => `Более чем за ${hours} ч до начала — возврат ${percent}%`,
		cancellationNone: 'Возврат при отмене не предусмотрен.',
		bringCash: (amount) => `Оплата при встрече: возьмите с собой ${amount}.`,
		outro: 'Будем рады видеть вас на мероприятии.',
		signature: 'Команда Event Space',
		paymentMethodLabels: {
			SITE_PAYMENT: 'Оплачено онлайн',
			OFFLINE_PAID: 'Оплачено оффлайн',
			PAY_ON_ARRIVAL: 'Оплата при прибытии',
		},
	},
	hy: {
		subject: 'Ամրագրման հաստատում',
		title: 'Ամրագրումը հաստատված է',
		intro: 'Շնորհակալություն ամրագրման համար! Ահա մանրամասները.',
		reference: 'Համար',
		event: 'Միջոցառում',
		location: 'Վայրը',
		date: 'Ամսաթիվ',
		time: 'Ժամը',
		quantity: 'Քանակ',
		bookedBy: 'Ամրագրել է',
		bookedAt: 'Ամրագրման ամսաթիվ',
		paymentMethod: 'Վճարման եղանակ',
		amount: 'Գումար',
		meetingPoint: 'Հավաքատեղի',
		openMap: 'Բացել քարտեզում',
		included: 'Ինչ է ներառված',
		cancellationTitle: 'Չեղարկում',
		cancellationRule: (hours, percent) =>
			`Մեկնարկից ${hours} ժամ առաջ և ավելի՝ վերադարձվում է ${percent}%`,
		cancellationNone: 'Չեղարկման դեպքում գումարը չի վերադարձվում։',
		bringCash: (amount) => `Վճարում ժամանելուն պես՝ վերցրեք ${amount}։`,
		outro: 'Կսպասենք ձեզ միջոցառմանը:',
		signature: 'Event Space թիմ',
		paymentMethodLabels: {
			SITE_PAYMENT: 'Վճարված է առցանց',
			OFFLINE_PAID: 'Վճարված է օֆլայն',
			PAY_ON_ARRIVAL: 'Վճարում ժամանելուն պես',
		},
	},
};

interface BookingReminderStrings {
	subject: (eventTitle: string) => string;
	title: string;
	greeting: (userName: string) => string;
	intro: (eventTitle: string, day: string) => string;
	outro: string;
}

export const BOOKING_REMINDER_STRINGS: Record<Locale, BookingReminderStrings> = {
	en: {
		subject: (eventTitle) => `Tomorrow: ${eventTitle}`,
		title: 'Your tour is tomorrow',
		greeting: (userName) => `Dear ${userName},`,
		intro: (eventTitle, day) =>
			`A reminder that "${eventTitle}" starts tomorrow, on ${day}. Here are the details:`,
		outro: 'See you tomorrow. If anything changes, just reply to this email.',
	},
	ru: {
		subject: (eventTitle) => `Завтра: ${eventTitle}`,
		title: 'Тур завтра',
		greeting: (userName) => `Здравствуйте, ${userName}!`,
		intro: (eventTitle, day) =>
			`Напоминаем: тур «${eventTitle}» начинается завтра, ${day} — вот детали:`,
		outro: 'До встречи. Если планы изменились — просто ответьте на это письмо.',
	},
	hy: {
		subject: (eventTitle) => `Վաղը՝ ${eventTitle}`,
		title: 'Տուրը վաղն է',
		greeting: (userName) => `Բարև Ձեզ, ${userName}:`,
		intro: (eventTitle, day) =>
			`Հիշեցնում ենք՝ «${eventTitle}» տուրը մեկնարկում է վաղը՝ ${day}։ Ահա մանրամասները.`,
		outro: 'Կսպասենք Ձեզ վաղը։ Եթե ծրագրերը փոխվել են, պարզապես պատասխանեք այս նամակին։',
	},
};

const LOCALE_INTL: Record<Locale, string> = { en: 'en-US', ru: 'ru-RU', hy: 'hy-AM' };

export function formatMailDay(date: Date, locale: Locale): string {
	return new Intl.DateTimeFormat(LOCALE_INTL[locale] ?? LOCALE_INTL[DEFAULT_LOCALE], {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
}

export function formatMailAmount(amount: number, currency: string, locale: Locale): string {
	const formatted = new Intl.NumberFormat(LOCALE_INTL[locale] ?? LOCALE_INTL[DEFAULT_LOCALE], {
		minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
		maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
	}).format(amount);

	return `${formatted} ${currency}`;
}

export function formatMailTime(date: Date, locale: Locale): string {
	return new Intl.DateTimeFormat(LOCALE_INTL[locale] ?? LOCALE_INTL[DEFAULT_LOCALE], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		hourCycle: 'h23',
	}).format(date);
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function formatMailDate(date: Date, locale: Locale): string {
	return new Intl.DateTimeFormat(LOCALE_INTL[locale] ?? LOCALE_INTL[DEFAULT_LOCALE], {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		hourCycle: 'h23',
	}).format(date);
}
