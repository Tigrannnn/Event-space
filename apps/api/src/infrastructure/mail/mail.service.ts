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
			if (this.config.get(EnvKey.NODE_ENV) === 'development') {
				this.logger.warn(`[DEV] Verification code: ${code}`);
			}
			throw new Error('Email service unavailable');
		}
	}
}
