import { EnvKey } from '@event-space/shared';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailTemplateService } from './mail-template.service';

@Injectable()
export class MailService {
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
			this.logger.error(`Failed to send email to ${email}`);
			const devOrTest =
				this.config.get(EnvKey.MAIL_DEV_MODE) === 'true' ||
				this.config.get(EnvKey.NODE_ENV) === 'development' ||
				this.config.get(EnvKey.NODE_ENV) === 'test';

			if (devOrTest) {
				this.logger.warn(`[DEV] Verification code for ${email}: ${code}`);
				return;
			}

			throw new Error('Email service unavailable');
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
			this.logger.error(`Failed to send event cancelled email to ${email}`);
			const devOrTest =
				this.config.get(EnvKey.MAIL_DEV_MODE) === 'true' ||
				this.config.get(EnvKey.NODE_ENV) === 'development' ||
				this.config.get(EnvKey.NODE_ENV) === 'test';

			if (devOrTest) {
				this.logger.warn(`[DEV] Event cancelled email for ${email}: event ${eventTitle}, refund ${refundAmount}`);
				return;
			}

			// Don't throw, just log - we don't want email failures to block event cancellation
		}
	}
}
