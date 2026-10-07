import { AppErrorCode, AuthAction, EnvKey } from '@event-space/shared';
import { AppException } from '@shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Locale, PaymentMethod } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { MailTemplateService } from './mail-template.service';
import {
	BOOKING_CONFIRMATION_STRINGS,
	EVENT_CANCELLED_STRINGS,
	VERIFICATION_STRINGS,
	formatMailDate,
	pickLocale,
} from './mail-strings';

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
		if (this.resendApiKey) {
			this.logger.log('Mail delivery via Resend HTTP API');
			return;
		}

		try {
			await this.transporter.verify();
			this.logger.log('SMTP connection verified');
		} catch (error) {
			this.logSmtpError('SMTP connection failed', error);
		}
	}

	private get resendApiKey(): string | undefined {
		return this.config.get<string>(EnvKey.RESEND_API_KEY) || undefined;
	}

	/**
	 * Single delivery point: Resend's HTTP API when a key is configured, SMTP
	 * otherwise. Hosts such as Railway block outbound SMTP below their paid
	 * tiers, so production sends over HTTP while local dev keeps using SMTP.
	 */
	private async deliver(message: {
		to: string;
		subject: string;
		text: string;
		html: string;
	}): Promise<void> {
		const from = `"Event Space" <${this.config.get(EnvKey.SMTP_FROM)}>`;
		const apiKey = this.resendApiKey;

		if (!apiKey) {
			await this.transporter.sendMail({ from, ...message });
			return;
		}

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ from, ...message }),
		});

		if (!response.ok) {
			throw new Error(`Resend request failed (${response.status}): ${await response.text()}`);
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

	async sendVerificationCode(
		email: string,
		code: string,
		action: AuthAction,
		locale: Locale,
	): Promise<void> {
		const strings = pickLocale(VERIFICATION_STRINGS, locale);
		const actionLabel = strings.actions[action] ?? action;

		const html = await this.templateService.render('verification', {
			TITLE: strings.title,
			INTRO: strings.intro(actionLabel),
			CODE: code,
			EXPIRY: strings.expiry,
			IGNORE_NOTE: strings.ignoreNote,
		});

		try {
			await this.deliver({
				to: email,
				subject: strings.subject,
				text: `${strings.intro(actionLabel)} ${code}\n${strings.expiry}`,
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

	async sendEventCancelledEmail(params: {
		email: string;
		userName: string;
		eventTitle: string;
		eventDate: Date;
		refundAmount: string;
		locale: Locale;
		cancellationReason?: string;
	}): Promise<void> {
		const strings = pickLocale(EVENT_CANCELLED_STRINGS, params.locale);
		const formattedDate = formatMailDate(params.eventDate, params.locale);
		const reasonLine = params.cancellationReason
			? strings.reason(params.cancellationReason)
			: undefined;

		const html = await this.templateService.render('event-cancelled', {
			TITLE: strings.title,
			GREETING: strings.greeting(params.userName),
			BODY: strings.body(params.eventTitle, formattedDate),
			REASON_BLOCK: reasonLine
				? `<mj-text align="left" font-size="15px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">${reasonLine}</mj-text>`
				: '',
			REFUND: strings.refund(params.refundAmount),
			SUPPORT: strings.support,
			SIGNOFF: strings.signoff,
			SIGNATURE: strings.signature,
		});

		try {
			await this.deliver({
				to: params.email,
				subject: strings.subject(params.eventTitle),
				text: [
					strings.greeting(params.userName),
					strings.body(params.eventTitle, formattedDate),
					reasonLine,
					strings.refund(params.refundAmount),
					strings.support,
					`${strings.signoff} ${strings.signature}`,
				]
					.filter(Boolean)
					.join('\n\n'),
				html: html,
			});
		} catch (error) {
			this.logSmtpError(`Failed to send event cancelled email to ${params.email}`, error);

			if (this.isDevOrTest()) {
				this.logger.warn(
					`[DEV] Event cancelled email for ${params.email}: event ${params.eventTitle}, refund ${params.refundAmount}`,
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
		const strings = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const formattedDate = formatMailDate(params.occurrenceDate, params.locale);
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

			await this.deliver({
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
