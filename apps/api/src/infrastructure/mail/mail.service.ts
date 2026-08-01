import { AppErrorCode, EnvKey } from '@event-space/shared';
import { AppException } from '@shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Locale, PaymentMethod } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { MailTemplateService } from './mail-template.service';

const BOOKING_CONFIRMATION_STRINGS: Record<
	Locale,
	{
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
> = {
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

@Injectable()
export class MailService implements OnModuleInit {
	private readonly transporter: nodemailer.Transporter;
	private readonly logger = new Logger(MailService.name);

	constructor(
		private readonly config: ConfigService,
		private readonly templateService: MailTemplateService,
	) {
		this.transporter = nodemailer.createTransport({
			host: this.config.get(EnvKey.SMTP_HOST),
			port: Number(this.config.get(EnvKey.SMTP_PORT)) || 587,
			secure: this.config.get(EnvKey.SMTP_PORT) === '465',
			auth: {
				user: this.config.get(EnvKey.SMTP_USER),
				pass: this.config.get(EnvKey.SMTP_PASS),
			},
			connectionTimeout: 15000,
			greetingTimeout: 15000,
			socketTimeout: 15000,
		});
	}

	async onModuleInit() {
		try {
			await this.transporter.verify();
			this.logger.log('SMTP connection verified');
		} catch (error) {
			this.logSmtpError('SMTP connection failed', error);
		}
	}

	private isDevOrTest(): boolean {
		return (
			this.config.get(EnvKey.MAIL_DEV_MODE) === 'true' ||
			this.config.get(EnvKey.NODE_ENV) === 'development' ||
			this.config.get(EnvKey.NODE_ENV) === 'test'
		);
	}

	private logSmtpError(context: string, error: unknown) {
		const err = error as { message?: string; code?: string; command?: string; stack?: string };
		this.logger.error(context, {
			message: err?.message ?? String(error),
			code: err?.code,
			command: err?.command,
			stack: err?.stack,
		});
	}

	async sendVerificationCode(email: string, code: string, action: string): Promise<void> {
		const html = await this.templateService.render('verification', {
			CODE: code,
			ACTION: action,
		});

		try {
			await this.transporter.sendMail({
				from: `"Event Space" <${this.config.get(EnvKey.SMTP_FROM)}>`,
				to: email,
				subject: `Your verification code to ${action}`,
				text: `Your verification code is: ${code}, Expires in 15 minutes.`,
				html: html,
			});
		} catch (error) {
			this.logSmtpError(`Failed to send email to ${email}`, error);

			if (this.isDevOrTest()) {
				this.logger.warn(`[DEV] Verification code for ${email}: ${code}`);
				// В dev/test не блокируем флоу из-за недоступного SMTP — код уже в логе.
				return;
			}

			throw new AppException(AppErrorCode.EMAIL_SEND_FAILED);
		}
	}

	async sendEventCancelledEmail(
		email: string,
		userName: string,
		eventTitle: string,
		eventDate: Date,
		refundAmount: string,
		cancellationReason?: string,
	): Promise<void> {
		const formattedDate = eventDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});

		const html = await this.templateService.render('event-cancelled', {
			USER_NAME: userName,
			EVENT_TITLE: eventTitle,
			EVENT_DATE: formattedDate,
			REFUND_AMOUNT: refundAmount,
			CANCELLATION_REASON: cancellationReason || '',
		});

		try {
			await this.transporter.sendMail({
				from: `"Event Space" <${this.config.get(EnvKey.SMTP_FROM)}>`,
				to: email,
				subject: `Event Cancelled: ${eventTitle}`,
				text: `Dear ${userName},\n\nWe regret to inform you that the event "${eventTitle}" scheduled for ${formattedDate} has been cancelled.\n${cancellationReason ? `Reason for cancellation: ${cancellationReason}\n` : ''}\nYou will receive a full refund of ${refundAmount} to your original payment method. The refund may take 5-10 business days to appear in your account.\n\nIf you have any questions, please contact our support team.\n\nBest regards,\nThe Event Space Team`,
				html: html,
			});
		} catch (error) {
			this.logSmtpError(`Failed to send event cancelled email to ${email}`, error);

			if (this.isDevOrTest()) {
				this.logger.warn(
					`[DEV] Event cancelled email for ${email}: event ${eventTitle}, refund ${refundAmount}`,
				);
			}
		}
	}

	async sendBookingConfirmation(params: {
		to: string;
		locale: Locale;
		referenceNumber: number;
		eventTitle: string;
		eventLocation?: string;
		occurrenceDate: Date;
		quantity: number;
		amount: number;
		currency: string;
		paymentMethod: PaymentMethod;
	}): Promise<boolean> {
		const strings = BOOKING_CONFIRMATION_STRINGS[params.locale] ?? BOOKING_CONFIRMATION_STRINGS.en;
		const formattedDate = params.occurrenceDate.toLocaleDateString(params.locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
		const referenceLabel = `#${String(params.referenceNumber).padStart(6, '0')}`;
		const paymentMethodLabel =
			strings.paymentMethodLabels[params.paymentMethod] ?? params.paymentMethod;

		try {
			const html = await this.templateService.render('booking-confirmation', {
				TITLE: strings.title,
				INTRO: strings.intro,
				LABEL_REFERENCE: strings.reference,
				REFERENCE_NUMBER: referenceLabel,
				LABEL_EVENT: strings.event,
				EVENT_TITLE: params.eventTitle,
				LABEL_LOCATION: strings.location,
				EVENT_LOCATION: params.eventLocation || '—',
				LABEL_DATE: strings.date,
				OCCURRENCE_DATE: formattedDate,
				LABEL_QUANTITY: strings.quantity,
				QUANTITY: String(params.quantity),
				LABEL_PAYMENT_METHOD: strings.paymentMethod,
				PAYMENT_METHOD: paymentMethodLabel,
				LABEL_AMOUNT: strings.amount,
				AMOUNT: params.amount.toFixed(2),
				CURRENCY: params.currency,
				OUTRO: strings.outro,
				SIGNATURE: strings.signature,
			});

			await this.transporter.sendMail({
				from: `"Event Space" <${this.config.get(EnvKey.SMTP_FROM)}>`,
				to: params.to,
				subject: strings.subject,
				text: `${strings.title}\n\n${strings.reference}: ${referenceLabel}\n${strings.event}: ${params.eventTitle}\n${strings.date}: ${formattedDate}\n${strings.quantity}: ${params.quantity}\n${strings.paymentMethod}: ${paymentMethodLabel}\n${strings.amount}: ${params.amount.toFixed(2)} ${params.currency}`,
				html,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send booking confirmation email to ${params.to}`, error);
			return false;
		}
	}
}
