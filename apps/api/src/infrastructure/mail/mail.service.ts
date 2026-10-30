import { AppErrorCode, AuthAction, EnvKey } from '@event-space/shared';
import { AppException } from '@shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Locale, PaymentMethod } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { MailTemplateService } from './mail-template.service';
import {
	buildBrandFooter,
	buildBrandLogoBlock,
	buildBrandTitle,
	resolveMailBrand,
	type MailBrand,
} from './mail-brand';
import { mailSkinTokens, mailSkinVariables } from './mail-skin';
import {
	BOOKING_CANCELLED_STRINGS,
	BOOKING_NO_SEATS_STRINGS,
	BOOKING_QUANTITY_CHANGED_STRINGS,
	BOOKING_CONFIRMATION_STRINGS,
	BOOKING_REMINDER_STRINGS,
	REVIEW_INVITE_STRINGS,
	EMAIL_CHANGED_STRINGS,
	REVIEW_PENDING_STRINGS,
	REVIEW_REPLY_STRINGS,
	escapeHtml,
	formatMailAmount,
	formatMailDay,
	formatMailTime,
	EVENT_CANCELLED_STRINGS,
	VERIFICATION_STRINGS,
	formatMailDate,
	formatMailZoneLabel,
	pickLocale,
	OCCURRENCE_RESCHEDULED_STRINGS,
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
			BRAND_PRIMARY: brand.colorPrimary,
			...mailSkinVariables(brand.skin, brand.colorPrimary),
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
		/** Pictures that travel inside the letter and are referenced from its HTML as `cid:<cid>`. */
		inlineImages?: { filename: string; content: Buffer; cid: string }[];
	}): Promise<void> {
		const { brand, inlineImages, ...mail } = message;
		const senderName = brand?.name ?? 'Event Space';
		const from = `"${senderName}" <${this.config.get(EnvKey.SMTP_FROM)}>`;
		const replyTo = brand?.replyTo;
		const apiKey = this.resendApiKey;

		if (!apiKey) {
			await this.transporter.sendMail({
				from,
				...mail,
				...(replyTo ? { replyTo } : {}),
				...(inlineImages?.length
					? {
							attachments: inlineImages.map((image) => ({
								filename: image.filename,
								content: image.content,
								cid: image.cid,
								contentDisposition: 'inline' as const,
							})),
						}
					: {}),
			});
			return;
		}

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from,
				...mail,
				...(replyTo ? { reply_to: replyTo } : {}),
				...(inlineImages?.length
					? {
							attachments: inlineImages.map((image) => ({
								filename: image.filename,
								content: image.content.toString('base64'),
								content_type: 'image/png',
								content_id: image.cid,
							})),
						}
					: {}),
			}),
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

	async sendOccurrenceRescheduledEmail(params: {
		email: string;
		userName: string;
		eventTitle: string;
		previousDate: Date;
		newDate: Date;
		locale: Locale;
		reason?: string;
		refundUntil?: Date | null;
		brandHost?: string;
	}): Promise<void> {
		const strings = pickLocale(OCCURRENCE_RESCHEDULED_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const actions = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		const previousDate = formatMailDate(params.previousDate, params.locale);
		const newDate = formatMailDate(params.newDate, params.locale);
		const reasonLine = params.reason ? strings.reason(params.reason) : undefined;
		const cantMakeLine = params.refundUntil
			? strings.cantMake(formatMailDate(params.refundUntil, params.locale))
			: undefined;

		const html = await this.templateService.render('occurrence-rescheduled', {
			...this.brandVariables(brand),
			TITLE: strings.title,
			GREETING: strings.greeting(params.userName),
			BODY: strings.body(params.eventTitle, previousDate, newDate),
			REASON_BLOCK: reasonLine
				? `<mj-text align="left" font-size="15px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">${reasonLine}</mj-text>`
				: '',
			KEEPS_BOOKING: strings.keepsBooking,
			CANT_MAKE: cantMakeLine ?? '',
			SUPPORT: strings.support,
			ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
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
					strings.body(params.eventTitle, previousDate, newDate),
					reasonLine,
					strings.keepsBooking,
					cantMakeLine,
					strings.support,
					...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
					`${strings.signoff} ${brand.name}`,
				]
					.filter(Boolean)
					.join('\n\n'),
				html,
			});
		} catch (error) {
			this.logSmtpError(`Failed to send occurrence rescheduled email to ${params.email}`, error);

			if (this.isDevOrTest()) {
				this.logger.warn(
					`[DEV] Occurrence rescheduled email for ${params.email}: ${params.eventTitle}, ${previousDate} -> ${newDate}`,
				);
			}
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
		const actions = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
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
			ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
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
					...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
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
		eventId: string;
		eventTitle: string;
		eventLocation?: string;
		eventLocationUrl?: string;
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
		checkinToken?: string | null;
		bookingId?: string;
		bookingLinkToken?: string | null;
	}): Promise<boolean> {
		const strings = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const siteBase = brand.siteUrl.replace(/\/+$/, '');
		const { homeUrl, bookingsUrl: memberBookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		// The link to this one booking works without signing in, so a guest can cancel, show the
		// QR and leave a review from the letter alone.
		const manageUrl =
			siteBase && params.bookingId && params.bookingLinkToken
				? `${siteBase}/${params.locale}/bookings/${encodeURIComponent(params.bookingId)}?t=${encodeURIComponent(params.bookingLinkToken)}`
				: undefined;
		const bookingsUrl = manageUrl ?? memberBookingsUrl;
		const actions = manageUrl ? { ...strings, myBookingsButton: strings.manageButton } : strings;
		const eventUrl = siteBase
			? `${siteBase}/${params.locale}/events/${encodeURIComponent(params.eventId)}`
			: undefined;
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

		const textRows = rows.flatMap(([label, value]) => {
			const linkedUrl =
				label === strings.event
					? eventUrl
					: label === strings.location
						? params.eventLocationUrl
						: undefined;
			return [`${label}: ${value}`, ...(linkedUrl ? [linkedUrl] : [])];
		});
		const textLines = [
			strings.title,
			'',
			...textRows,
			...(params.meetingLocation
				? [
						'',
						`${strings.meetingPoint}: ${params.meetingLocation}`,
						...(params.meetingLocationUrl ? [params.meetingLocationUrl] : []),
					]
				: []),
			...(params.paymentMethod === 'PAY_ON_ARRIVAL' ? ['', strings.bringCash(totalAmount)] : []),
			...(params.whatsIncluded?.length
				? ['', `${strings.included}:`, ...params.whatsIncluded.map((item) => `— ${item}`)]
				: []),
			...(cancellationLines.length ? ['', `${strings.cancellationTitle}:`, ...cancellationLines] : []),
			...(homeUrl || bookingsUrl ? [''] : []),
			...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
			'',
			strings.outro,
			brand.name,
		];

		try {
			const qr = await this.buildCheckinQrBlock(
				params.checkinToken,
				params.brandHost,
				strings.checkinQrLabel,
			);

			const html = await this.templateService.render('booking-confirmation', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				INTRO: strings.intro,
				HIGHLIGHT_BLOCK: this.buildBookingConfirmationMeetingBlock(strings, params),
				QR_BLOCK: qr.block,
				DETAILS_ROWS: this.buildDetailRows(rows, {
					[strings.event]: this.buildMailAnchor(eventUrl, params.eventTitle),
					[strings.location]: this.buildMailAnchor(params.eventLocationUrl, params.eventLocation || '—'),
				}),
				NOTE_BLOCK:
					params.paymentMethod === 'PAY_ON_ARRIVAL'
						? this.buildNoteBlock(strings.bringCash(totalAmount))
						: '',
				INCLUDED_BLOCK: this.buildListBlock(strings.included, params.whatsIncluded ?? []),
				CANCELLATION_BLOCK: this.buildListBlock(strings.cancellationTitle, cancellationLines),
				ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
				OUTRO: strings.outro,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject,
				text: textLines.join('\n'),
				html,
				brand,
				inlineImages: qr.inlineImages,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send booking confirmation email to ${params.to}`, error);
			return false;
		}
	}

	async sendBookingCancelledEmail(params: {
		to: string;
		locale: Locale;
		userName: string;
		referenceNumber: number;
		eventTitle: string;
		occurrenceDate: Date;
		refundAmount?: number;
		refundFailed?: boolean;
		refundCoveredByFee?: { entitled: number; fee: number };
		nothingPaid?: boolean;
		offlinePaid?: boolean;
		currency: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(BOOKING_CANCELLED_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const actions = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		const referenceLabel = `#${String(params.referenceNumber).padStart(6, '0')}`;
		const body = strings.body(
			params.eventTitle,
			formatMailDate(params.occurrenceDate, params.locale),
			referenceLabel,
		);

		const refundLine = params.refundFailed
			? strings.refundPending
			: params.refundAmount
				? strings.refund(formatMailAmount(params.refundAmount, params.currency, params.locale))
				: params.refundCoveredByFee
					? strings.refundCoveredByFee(
							formatMailAmount(params.refundCoveredByFee.entitled, params.currency, params.locale),
							formatMailAmount(params.refundCoveredByFee.fee, params.currency, params.locale),
						)
					: params.offlinePaid
						? strings.offlineRefund
						: params.nothingPaid
							? strings.nothingPaid
							: strings.noRefund;

		try {
			const html = await this.templateService.render('booking-cancelled', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				BODY: body,
				REFUND: refundLine,
				SUPPORT: strings.support,
				ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
				SIGNOFF: strings.signoff,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: [
					strings.greeting(params.userName),
					body,
					refundLine,
					strings.support,
					...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
					`${strings.signoff} ${brand.name}`,
				]
					.filter(Boolean)
					.join('\n\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send booking cancelled email to ${params.to}`, error);
			return false;
		}
	}

	async sendBookingNoSeatsEmail(params: {
		to: string;
		locale: Locale;
		userName: string;
		eventTitle: string;
		occurrenceDate: Date;
		refundAmount: number;
		refundFailed?: boolean;
		currency: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(BOOKING_NO_SEATS_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const actions = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		const body = strings.body(
			params.eventTitle,
			formatMailDate(params.occurrenceDate, params.locale),
		);
		const refundLine = params.refundFailed
			? strings.refundPending
			: strings.refund(formatMailAmount(params.refundAmount, params.currency, params.locale));

		try {
			const html = await this.templateService.render('booking-cancelled', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				BODY: body,
				REFUND: refundLine,
				SUPPORT: strings.support,
				ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
				SIGNOFF: strings.signoff,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: [
					strings.greeting(params.userName),
					body,
					refundLine,
					strings.support,
					...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
					`${strings.signoff} ${brand.name}`,
				].join('\n\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send no seats left email to ${params.to}`, error);
			return false;
		}
	}

	async sendBookingQuantityChanged(params: {
		to: string;
		locale: Locale;
		userName: string;
		referenceNumber: number;
		eventTitle: string;
		occurrenceDate: Date;
		oldQuantity: number;
		newQuantity: number;
		newAmount: number;
		byOrganiser: boolean;
		refund?:
			| { kind: 'refunded'; amount: number }
			| { kind: 'manual'; amount: number }
			| { kind: 'pending' }
			| { kind: 'notRefundable' };
		extra?: { kind: 'paidByCard'; amount: number };
		currency: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(BOOKING_QUANTITY_CHANGED_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const actions = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		const referenceLabel = `#${String(params.referenceNumber).padStart(6, '0')}`;
		const money = (amount: number) => formatMailAmount(amount, params.currency, params.locale);

		const body = strings.body(
			params.eventTitle,
			formatMailDate(params.occurrenceDate, params.locale),
			referenceLabel,
			params.oldQuantity,
			params.newQuantity,
			params.byOrganiser,
		);

		const moneyLines = [
			strings.newTotal(money(params.newAmount)),
			params.refund?.kind === 'refunded' ? strings.refund(money(params.refund.amount)) : '',
			params.refund?.kind === 'pending' ? strings.refundPending : '',
			params.refund?.kind === 'notRefundable' ? strings.notRefundable : '',
			params.refund?.kind === 'manual' ? strings.manualRefund(money(params.refund.amount)) : '',
			params.extra?.kind === 'paidByCard' ? strings.paidByCard(money(params.extra.amount)) : '',
		].filter(Boolean);

		try {
			const html = await this.templateService.render('booking-quantity-changed', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				BODY: body,
				MONEY_BLOCKS: moneyLines
					.map(
						(line) =>
							'<mj-text align="left" font-size="15px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">' +
							escapeHtml(line) +
							'</mj-text>',
					)
					.join(''),
				SUPPORT: strings.support,
				ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
				SIGNOFF: strings.signoff,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: [
					strings.greeting(params.userName),
					body,
					...moneyLines,
					strings.support,
					...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
					`${strings.signoff} ${brand.name}`,
				].join('\n\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send booking changed email to ${params.to}`, error);
			return false;
		}
	}

	async sendBookingQuantityNotAdded(params: {
		to: string;
		locale: Locale;
		userName: string;
		referenceNumber: number;
		eventTitle: string;
		occurrenceDate: Date;
		refundAmount: number;
		currency: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(BOOKING_QUANTITY_CHANGED_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const actions = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		const referenceLabel = `#${String(params.referenceNumber).padStart(6, '0')}`;
		const body = strings.notAddedBody(
			params.eventTitle,
			formatMailDate(params.occurrenceDate, params.locale),
			referenceLabel,
		);
		const refundLine = strings.notAddedRefund(
			formatMailAmount(params.refundAmount, params.currency, params.locale),
		);

		try {
			const html = await this.templateService.render('booking-quantity-changed', {
				...this.brandVariables(brand),
				TITLE: strings.notAddedTitle,
				GREETING: strings.greeting(params.userName),
				BODY: body,
				MONEY_BLOCKS:
					'<mj-text align="left" font-size="15px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">' +
					escapeHtml(refundLine) +
					'</mj-text>',
				SUPPORT: strings.support,
				ACTIONS_BLOCK: this.buildBookingActionButtons(actions, brand, homeUrl, bookingsUrl),
				SIGNOFF: strings.signoff,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.notAddedTitle,
				text: [
					strings.greeting(params.userName),
					body,
					refundLine,
					strings.support,
					...this.buildBookingActionText(actions, homeUrl, bookingsUrl),
					`${strings.signoff} ${brand.name}`,
				].join('\n\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send guests not added email to ${params.to}`, error);
			return false;
		}
	}

	async sendBookingReminder(params: {
		to: string;
		locale: Locale;
		referenceNumber: number;
		userName: string;
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
		brandHost?: string;
	}): Promise<boolean> {
		const labels = pickLocale(BOOKING_CONFIRMATION_STRINGS, params.locale);
		const strings = pickLocale(BOOKING_REMINDER_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const { homeUrl, bookingsUrl } = this.buildBookingPageUrls(brand, params.locale);
		const day = formatMailDay(params.occurrenceDate, params.locale);
		const referenceLabel = `#${String(params.referenceNumber).padStart(6, '0')}`;
		const totalAmount = formatMailAmount(params.amount, params.currency, params.locale);
		const timeRange = this.buildTimeRange(
			params.occurrenceDate,
			params.durationMinutes,
			params.locale,
		);

		const rows: [string, string][] = [
			[labels.event, params.eventTitle],
			[labels.date, day],
			[labels.time, timeRange],
			[labels.location, params.eventLocation || '—'],
			[labels.quantity, String(params.quantity)],
			[labels.reference, referenceLabel],
		];

		const intro = strings.intro(params.eventTitle, day);
		const textLines = [
			strings.greeting(params.userName),
			'',
			intro,
			'',
			...rows.map(([label, value]) => `${label}: ${value}`),
			...(params.meetingLocation ? ['', `${labels.meetingPoint}: ${params.meetingLocation}`] : []),
			...(params.meetingLocationUrl ? [params.meetingLocationUrl] : []),
			...(params.paymentMethod === 'PAY_ON_ARRIVAL' ? ['', labels.bringCash(totalAmount)] : []),
			...(params.whatsIncluded?.length
				? ['', `${labels.included}:`, ...params.whatsIncluded.map((item) => `— ${item}`)]
				: []),
			...(homeUrl || bookingsUrl ? [''] : []),
			...this.buildBookingActionText(labels, homeUrl, bookingsUrl),
			'',
			strings.outro,
			brand.name,
		];

		try {
			const html = await this.templateService.render('booking-reminder', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				INTRO: intro,
				HIGHLIGHT_BLOCK: this.buildMeetingBlock(labels, params),
				DETAILS_ROWS: this.buildDetailRows(rows),
				NOTE_BLOCK:
					params.paymentMethod === 'PAY_ON_ARRIVAL'
						? this.buildNoteBlock(labels.bringCash(totalAmount))
						: '',
				INCLUDED_BLOCK: this.buildListBlock(labels.included, params.whatsIncluded ?? []),
				ACTIONS_BLOCK: this.buildBookingActionButtons(labels, brand, homeUrl, bookingsUrl),
				OUTRO: strings.outro,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: textLines.join('\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send booking reminder email to ${params.to}`, error);
			return false;
		}
	}

	/**
	 * The invitation to rate a tour that has just ended.
	 *
	 * The five stars are links, each carrying its own score: tapping one opens the form with
	 * the rating already chosen. That first tap is most of what stops people from answering,
	 * and it costs nothing to make it happen in the inbox instead of on the page.
	 */
	async sendReviewInvite(params: {
		to: string;
		locale: Locale;
		userName: string;
		eventTitle: string;
		reviewUrl: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(REVIEW_INVITE_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const intro = strings.intro(params.eventTitle);

		const textLines = [
			strings.greeting(params.userName),
			'',
			intro,
			'',
			params.reviewUrl,
			'',
			strings.outro,
			brand.name,
		];

		try {
			const html = await this.templateService.render('review-invite', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				INTRO: intro,
				RATE_HINT: strings.rateHint,
				STARS_BLOCK: this.buildStarsBlock(params.reviewUrl),
				REVIEW_URL: params.reviewUrl,
				BUTTON: strings.button,
				OUTRO: strings.outro,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: textLines.join('\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send review invite email to ${params.to}`, error);
			return false;
		}
	}

	/**
	 * Five stars as plain text characters rather than images: most mail clients hide remote
	 * images by default, and a row of empty boxes is worse than no stars at all.
	 */
	private buildStarsBlock(reviewUrl: string): string {
		const separator = reviewUrl.includes('?') ? '&' : '?';
		const stars = [1, 2, 3, 4, 5]
			.map(
				(rating) =>
					`<a href="${escapeHtml(`${reviewUrl}${separator}rating=${rating}`)}" ` +
					`style="text-decoration: none; color: #f59e0b; font-size: 34px; padding: 0 6px;">&#9733;</a>`,
			)
			.join('');

		return `<mj-text align="center" padding="0px 0px 16px 0px">${stars}</mj-text>`;
	}

	/**
	 * Tells the company a review is waiting.
	 *
	 * Nothing else does: without it a review with text sits in the queue until somebody happens
	 * to open the admin panel, and the person who wrote it waits with no idea why.
	 */
	async sendReviewPendingNotice(params: {
		to: string;
		locale: Locale;
		authorName: string;
		eventTitle: string;
		rating: number;
		text?: string | null;
		queueUrl: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(REVIEW_PENDING_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const intro = strings.intro(params.authorName, params.eventTitle);
		const rows: [string, string][] = [[strings.rating, `${params.rating}/5`]];

		try {
			const html = await this.templateService.render('review-pending', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				INTRO: intro,
				DETAILS_ROWS: this.buildDetailRows(rows),
				QUOTE_BLOCK: params.text ? this.buildQuoteBlock(params.text) : '',
				QUEUE_URL: params.queueUrl,
				BUTTON: strings.button,
				OUTRO: strings.outro,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: [
					intro,
					'',
					`${strings.rating}: ${params.rating}/5`,
					'',
					params.text ?? '',
					'',
					params.queueUrl,
				].join('\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send review notice to ${params.to}`, error);
			return false;
		}
	}

	async sendEmailChangedNotice(params: {
		to: string;
		locale: Locale;
		userName: string;
		newEmail: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(EMAIL_CHANGED_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);

		try {
			const html = await this.templateService.render('email-changed', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				INTRO: strings.intro,
				NEW_EMAIL: params.newEmail,
				WARNING: strings.warning,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject,
				text: [
					strings.greeting(params.userName),
					'',
					strings.intro,
					params.newEmail,
					'',
					strings.warning,
				].join('\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send the email-change notice to ${params.to}`, error);
			return false;
		}
	}

	/** Tells the author the company has answered, since nothing would bring them back otherwise. */
	async sendReviewReply(params: {
		to: string;
		locale: Locale;
		userName: string;
		eventTitle: string;
		reviewText?: string | null;
		reply: string;
		eventUrl: string;
		brandHost?: string;
	}): Promise<boolean> {
		const strings = pickLocale(REVIEW_REPLY_STRINGS, params.locale);
		const brand = this.brandFor(params.brandHost);
		const intro = strings.intro(params.eventTitle);

		try {
			const html = await this.templateService.render('review-reply', {
				...this.brandVariables(brand),
				TITLE: strings.title,
				GREETING: strings.greeting(params.userName),
				INTRO: intro,
				REVIEW_BLOCK: params.reviewText
					? this.buildLabelledQuote(strings.yourReview, params.reviewText)
					: '',
				REPLY_BLOCK: this.buildLabelledQuote(strings.ourReply, params.reply),
				EVENT_URL: params.eventUrl,
				BUTTON: strings.button,
				OUTRO: strings.outro,
				SIGNATURE: brand.name,
			});

			await this.deliver({
				to: params.to,
				subject: strings.subject(params.eventTitle),
				text: [
					strings.greeting(params.userName),
					'',
					intro,
					'',
					...(params.reviewText ? [`${strings.yourReview}: ${params.reviewText}`, ''] : []),
					`${strings.ourReply}: ${params.reply}`,
					'',
					params.eventUrl,
					'',
					strings.outro,
					brand.name,
				].join('\n'),
				html,
				brand,
			});

			return true;
		} catch (error) {
			this.logSmtpError(`Failed to send review reply email to ${params.to}`, error);
			return false;
		}
	}

	private buildQuoteBlock(text: string): string {
		return (
			'<mj-text align="left" font-size="15px" color="#111827" padding="0px 0px 20px 0px" ' +
			'css-class="text-main"><em>' +
			escapeHtml(text) +
			'</em></mj-text>'
		);
	}

	private buildLabelledQuote(label: string, text: string): string {
		return (
			'<mj-text align="left" font-size="14px" color="#6b7280" padding="0px 0px 16px 0px" ' +
			'css-class="text-muted"><strong>' +
			escapeHtml(label) +
			'</strong><br /><span style="color: #111827;">' +
			escapeHtml(text) +
			'</span></mj-text>'
		);
	}

	private buildTimeRange(start: Date, durationMinutes: number | undefined, locale: Locale): string {
		const zone = formatMailZoneLabel(start, locale);
		const startLabel = formatMailTime(start, locale);
		if (!durationMinutes) return `${startLabel} · ${zone}`;

		const end = new Date(start.getTime() + durationMinutes * 60_000);
		return `${startLabel} — ${formatMailTime(end, locale)} · ${zone}`;
	}

	private buildDetailRows(
		rows: [string, string][],
		linkedValues: Record<string, string> = {},
	): string {
		return rows
			.map(
				([label, value], index) =>
					`<tr style="${index < rows.length - 1 ? 'border-bottom: 1px solid #e5e7eb; ' : ''}text-align: left;">` +
					`<td style="padding: 8px 0; font-weight: 600;">${escapeHtml(label)}</td>` +
					`<td style="padding: 8px 0;">${linkedValues[label] ?? escapeHtml(value)}</td></tr>`,
			)
			.join('');
	}

	private buildMailAnchor(url: string | undefined, label: string): string {
		if (!url) return escapeHtml(label);

		try {
			const parsed = new URL(url);
			if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return escapeHtml(label);
		} catch {
			return escapeHtml(label);
		}

		return `<a href="${escapeHtml(url)}" target="_blank" style="color: #00a5ba; text-decoration: underline;">${escapeHtml(label)}</a>`;
	}

	private buildBookingConfirmationMeetingBlock(
		strings: { meetingPoint: string },
		params: { meetingLocation?: string; meetingLocationUrl?: string },
	): string {
		if (!params.meetingLocation && !params.meetingLocationUrl) return '';

		const location = params.meetingLocation
			? this.buildMailAnchor(params.meetingLocationUrl, params.meetingLocation)
			: this.buildMailAnchor(params.meetingLocationUrl, params.meetingLocationUrl ?? '');

		return (
			'<mj-text align="left" font-size="15px" color="#111827" padding="0px 0px 20px 0px" css-class="text-main">' +
			`<strong>${escapeHtml(strings.meetingPoint)}:</strong> ${location}` +
			'</mj-text>'
		);
	}

	private buildBookingActionButtons(
		strings: { homeButton: string; myBookingsButton: string },
		brand: MailBrand,
		homeUrl: string | undefined,
		bookingsUrl: string | undefined,
	): string {
		const button = (url: string | undefined, label: string) =>
			url
				? `<mj-button href="${escapeHtml(url)}" css-class="outline-button" background-color="#ffffff" border="2px solid ${escapeHtml(brand.colorPrimary)}" color="${escapeHtml(brand.colorPrimary)}" border-radius="${mailSkinTokens(brand.skin).buttonRadius}" font-size="16px" font-weight="700" padding="6px 0" inner-padding="14px 20px" width="100%">${escapeHtml(label)}</mj-button>`
				: '';

		return button(homeUrl, strings.homeButton) + button(bookingsUrl, strings.myBookingsButton);
	}

	private buildBookingPageUrls(brand: MailBrand, locale: Locale) {
		const siteBase = brand.siteUrl.replace(/\/+$/, '');

		return {
			homeUrl: siteBase ? `${siteBase}/${locale}` : undefined,
			bookingsUrl: siteBase ? `${siteBase}/${locale}/bookings` : undefined,
		};
	}

	private buildBookingActionText(
		strings: { homeButton: string; myBookingsButton: string },
		homeUrl: string | undefined,
		bookingsUrl: string | undefined,
	): string[] {
		return [
			homeUrl ? `${strings.homeButton}: ${homeUrl}` : '',
			bookingsUrl ? `${strings.myBookingsButton}: ${bookingsUrl}` : '',
		].filter(Boolean);
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

	/**
	 * A QR the admin's camera reads straight into the check-in page — no token means no code.
	 *
	 * The picture is attached to the letter and shown by `cid:`, not linked and not embedded as
	 * a `data:` address: Gmail and Outlook drop the second kind, and the first needs a public
	 * address that a letter opened from a development machine cannot reach.
	 */
	private async buildCheckinQrBlock(
		checkinToken: string | null | undefined,
		brandHost: string | undefined,
		label: string,
	): Promise<{ block: string; inlineImages: { filename: string; content: Buffer; cid: string }[] }> {
		if (!checkinToken) return { block: '', inlineImages: [] };

		const siteUrl = this.brandFor(brandHost).siteUrl.replace(/\/+$/, '');
		const checkinUrl = `${siteUrl}/admin/checkin?token=${encodeURIComponent(checkinToken)}`;

		try {
			const content = await QRCode.toBuffer(checkinUrl, { margin: 1, width: 240 });
			return {
				block:
					'<mj-image width="160px" padding="8px 0px 4px 0px" src="cid:checkin-qr" alt="QR" />' +
					`<mj-text align="center" font-size="12px" color="#6b7280" padding="0px 0px 20px 0px" css-class="text-muted">${escapeHtml(label)}</mj-text>`,
				inlineImages: [{ filename: 'checkin-qr.png', content, cid: 'checkin-qr' }],
			};
		} catch {
			return { block: '', inlineImages: [] };
		}
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
