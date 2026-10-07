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

interface BookingConfirmationStrings {
	subject: string;
	title: string;
	intro: string;
	reference: string;
	event: string;
	location: string;
	date: string;
	quantity: string;
	paymentMethod: string;
	amount: string;
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
		quantity: 'Quantity',
		paymentMethod: 'Payment method',
		amount: 'Amount',
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
		quantity: 'Количество мест',
		paymentMethod: 'Способ оплаты',
		amount: 'Сумма',
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
		quantity: 'Քանակ',
		paymentMethod: 'Վճարման եղանակ',
		amount: 'Գումար',
		outro: 'Կսպասենք ձեզ միջոցառմանը:',
		signature: 'Event Space թիմ',
		paymentMethodLabels: {
			SITE_PAYMENT: 'Վճարված է առցանց',
			OFFLINE_PAID: 'Վճարված է օֆլայն',
			PAY_ON_ARRIVAL: 'Վճարում ժամանելուն պես',
		},
	},
};

const LOCALE_INTL: Record<Locale, string> = { en: 'en-US', ru: 'ru-RU', hy: 'hy-AM' };

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
