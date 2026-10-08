import { AppErrorCode, AuthAction, EnvKey } from '@event-space/shared';
import { AppException } from '@shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Locale, PaymentMethod } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { MailTemplateService } from './mail-template.service';
import {
	buildBrandFooter,
	buildBrandLogoBlock,
	buildBrandTitle,
	resolveMailBrand,
	type MailBrand,
} from './mail-brand';
import {
	BOOKING_CONFIRMATION_STRINGS,
	escapeHtml,
	formatMailAmount,
	formatMailDay,
	formatMailTime,
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

	brandFor(host?: string | null): MailBrand {
		return resolveMailBrand(host, this.config.get<string>(EnvKey.FRONTEND_URL) ?? '');
	}

	private brandVariables(brand: MailBrand): Record<string, string> {
		return {
			BRAND_NAME: brand.name,
			BRAND_LOGO: buildBrandLogoBlock(brand),
			BRAND_TITLE: buildBrandTitle(brand),
			BRAND_FOOTER: buildBrandFooter(brand),
		};
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
		brand?: MailBrand;
	}): Promise<void> {
		const { brand, ...mail } = message;
		const senderName = brand?.name ?? 'Event Space';
		const from = `"${senderName}" <${this.config.get(EnvKey.SMTP_FROM)}>`;
		const replyTo = brand?.replyTo;
		const apiKey = this.resendApiKey;

		if (!apiKey) {
			await this.transporter.sendMail({ from, ...mail, ...(replyTo ? { replyTo } : {}) });
			return;
		}

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ from, ...mail, ...(replyTo ? { reply_to: replyTo } : {}) }),
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
		brandHost?: string,
	): Promise<void> {
		const strings = pickLocale(VERIFICATION_STRINGS, locale);
		const actionLabel = strings.actions[action] ?? action;
		const brand = this.brandFor(brandHost);

		const html = await this.templateService.render('verification', {
			...this.brandVariables(brand),
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
				brand,
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
		brandHost?: string;
	}): Promise<void> {
		const strings = pickLocale(EVENT_CANCELLED_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const formattedDate = formatMailDate(params.eventDate, params.locale);
		const reasonLine = params.cancellationReason
			? strings.reason(params.cancellationReason)
			: undefined;

		const html = await this.templateService.render('event-cancelled', {
			...this.brandVariables(brand),
			TITLE: strings.title,
			GREETING: strings.greeting(params.userName),
			BODY: strings.body(params.eventTitle, formattedDate),
			REASON_BLOCK: reasonLine
				? `<mj-text align="left" font-size="15px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">${reasonLine}</mj-text>`
				: '',
			REFUND: strings.refund(params.refundAmount),
			SUPPORT: strings.support,
			SIGNOFF: strings.signoff,
			SIGNATURE: brand.name,
		});

		try {
			await this.deliver({
				to: params.email,
				subject: strings.subject(params.eventTitle),
				brand,
				text: [
					strings.greeting(params.userName),
					strings.body(params.eventTitle, formattedDate),
					reasonLine,
					strings.refund(params.refundAmount),
					strings.support,
					`${strings.signoff} ${brand.name}`,
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
		userName: string;
		bookedAt: Date;
		eventTitle: string;
		eventLocation?: string;
		meetingLocation?: string;
		meetingLocationUrl?: string;
		occurrenceDate: Date;
		durationMinutes?: number;
		quantity: number;
		amount: number;
		currency: string;
		paymentMethod: PaymentMethod;
		whatsIncluded?: string[];
		cancellationRules?: { hoursBeforeEvent: number; refundPercentage: number }[];
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const formattedDate = formatMailDate(params.occurrenceDate, params.locale);
		const referenceLabel = `#${String(params.referenceNumber).padStart(6, '0')}`;
		const paymentMethodLabel =
			strings.paymentMethodLabels[params.paymentMethod] ?? params.paymentMethod;
		const totalAmount = formatMailAmount(params.amount, params.currency, params.locale);
		const timeRange = this.buildTimeRange(
			params.occurrenceDate,
			params.durationMinutes,
			params.locale,
		);

		const rows: [string, string][] = [
			[strings.reference, referenceLabel],
			[strings.event, params.eventTitle],
			[strings.location, params.eventLocation || '—'],
			[strings.date, timeRange ? formatMailDay(params.occurrenceDate, params.locale) : formattedDate],
			...(timeRange ? ([[strings.time, timeRange]] as [string, string][]) : []),
			[strings.quantity, String(params.quantity)],
			[strings.bookedBy, params.userName],
			[strings.bookedAt, formatMailDate(params.bookedAt, params.locale)],
			[strings.paymentMethod, paymentMethodLabel],
			[strings.amount, totalAmount],
		];

		const cancellationLines = (params.cancellationRules ?? [])
			.slice()
			.sort((a, b) => b.hoursBeforeEvent - a.hoursBeforeEvent)
			.map((rule) => strings.cancellationRule(rule.hoursBeforeEvent, rule.refundPercentage));

		const textLines = [
			strings.title,
			'',
			...rows.map(([label, value]) => `${label}: ${value}`),
			...(params.meetingLocation ? ['', `${strings.meetingPoint}: ${params.meetingLocation}`] : []),
			...(params.meetingLocationUrl ? [params.meetingLocationUrl] : []),
			...(params.paymentMethod === 'PAY_ON_ARRIVAL' ? ['', strings.bringCash(totalAmount)] : []),
			...(params.whatsIncluded?.length
				? ['', `${strings.included}:`, ...params.whatsIncluded.map((item) => `— ${item}`)]
				: []),
			...(cancellationLines.length ? ['', `${strings.cancellationTitle}:`, ...cancellationLines] : []),
			'',
			strings.outro,
			brand.name,
		];

		try {
			const html = await this.templateService.render('booking-confirmation', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				INTRO: strings.intro,
				HIGHLIGHT_BLOCK: this.buildMeetingBlock(strings, params),
				DETAILS_ROWS: this.buildDetailRows(rows),
				NOTE_BLOCK:
					params.paymentMethod === 'PAY_ON_ARRIVAL'
						? this.buildNoteBlock(strings.bringCash(totalAmount))
						: '',
				INCLUDED_BLOCK: this.buildListBlock(strings.included, params.whatsIncluded ?? []),
				CANCELLATION_BLOCK: this.buildListBlock(strings.cancellationTitle, cancellationLines),
				OUTRO: strings.outro,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject,
				text: textLines.join('\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send booking confirmation email to ${params.to}`, error);
			return false;
		}
	}

	private buildTimeRange(start: Date, durationMinutes: number | undefined, locale: Locale): string {
		const startLabel = formatMailTime(start, locale);
		if (!durationMinutes) return startLabel;

		const end = new Date(start.getTime() + durationMinutes * 60_000);
		return `${startLabel} — ${formatMailTime(end, locale)}`;
	}

	private buildDetailRows(rows: [string, string][]): string {
		return rows
			.map(
				([label, value], index) =>
					`<tr style="${index < rows.length - 1 ? 'border-bottom: 1px solid #e5e7eb; ' : ''}text-align: left;">` +
					`<td style="padding: 8px 0; font-weight: 600;">${escapeHtml(label)}</td>` +
					`<td style="padding: 8px 0;">${escapeHtml(value)}</td></tr>`,
			)
			.join('');
	}

	private buildMeetingBlock(
		strings: { meetingPoint: string; openMap: string },
		params: { meetingLocation?: string; meetingLocationUrl?: string },
	): string {
		if (!params.meetingLocation && !params.meetingLocationUrl) return '';

		const link = params.meetingLocationUrl
			? `<br /><a href="${escapeHtml(params.meetingLocationUrl)}" style="color: #00a5ba;">${escapeHtml(strings.openMap)}</a>`
			: '';

		return (
			'<mj-text align="left" font-size="15px" color="#111827" padding="0px 0px 20px 0px" css-class="text-main">' +
			`<strong>${escapeHtml(strings.meetingPoint)}:</strong> ${escapeHtml(params.meetingLocation ?? '')}${link}` +
			'</mj-text>'
		);
	}

	private buildNoteBlock(note: string): string {
		return (
			'<mj-text align="left" font-size="15px" color="#b45309" padding="0px 0px 20px 0px">' +
			escapeHtml(note) +
			'</mj-text>'
		);
	}

	private buildListBlock(title: string, items: string[]): string {
		if (!items.length) return '';

		const list = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
		return (
			'<mj-text align="left" font-size="14px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">' +
			`<strong>${escapeHtml(title)}</strong><ul style="margin: 8px 0 0; padding-left: 18px;">${list}</ul>` +
			'</mj-text>'
		);
	}
}
