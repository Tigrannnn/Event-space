import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import mjml2html from 'mjml';

@Injectable()
export class MailTemplateService {
	private templates = new Map<string, string>();
	private baseTemplate?: string;

	onModuleInit() {
		// Try multiple possible paths for different environments
		const possiblePaths = [
			// Production/Docker path (relative to compiled JS)
			resolve(__dirname, '..', '..', '..', 'infrastructure', 'mail', 'templates'),
			// Development path (relative to src)
			resolve(process.cwd(), 'src', 'infrastructure', 'mail', 'templates'),
			// Alternative: apps/api path for monorepo
			resolve(process.cwd(), 'apps', 'api', 'src', 'infrastructure', 'mail', 'templates'),
			// Test environment fallback
			resolve(__dirname, '..', '..', '..', '..', 'src', 'infrastructure', 'mail', 'templates'),
		];

		let templatePath: string | null = null;
		for (const path of possiblePaths) {
			if (existsSync(join(path, 'base.mjml'))) {
				templatePath = path;
				break;
			}
		}

		if (!templatePath) {
			console.warn(
				'MJML templates not found. Email will use text-only mode. ' +
					'Searched paths: ' +
					possiblePaths.join(', '),
			);
			return;
		}

		try {
			this.baseTemplate = readFileSync(resolve(templatePath, 'base.mjml'), 'utf-8');
			this.loadTemplate('verification', templatePath);
			this.loadTemplate('event-cancelled', templatePath);
			this.loadTemplate('booking-receipt', templatePath);
			console.log(`Mail templates loaded from: ${templatePath}`);
		} catch (error) {
			console.error('Failed to load mail templates:', error);
		}
	}

	async render(templateName: string, variables: Record<string, string>): Promise<string> {
		// Fallback to plain text if templates not available
		if (!this.baseTemplate) {
			console.warn('Base template was not loaded');
			return this.renderPlainText(variables);
		}

		const contentMjml = this.templates.get(templateName);
		if (!contentMjml) {
			console.warn(`Template ${templateName} not found, using plain text fallback`);
			return this.renderPlainText(variables);
		}

		let fullMjml = this.baseTemplate.replace('{{ CONTENT }}', contentMjml);

		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
			fullMjml = fullMjml.replace(regex, value);
		}

		const { html, errors } = await mjml2html(fullMjml, { validationLevel: 'soft' });

		if (errors.length > 0) {
			console.warn('MJML Errors:', errors);
		}

		return html;
	}

	private renderPlainText(variables: Record<string, string>): string {
		const code = variables['CODE'] || 'N/A';
		const action = variables['ACTION'] || 'verify';
		return `
			<html>
				<body>
					<h1>Event Space</h1>
					<p>Your verification code for ${action} is: <strong>${code}</strong></p>
					<p>Expires in 15 minutes.</p>
				</body>
			</html>
		`;
	}

	private loadTemplate(name: string, basePath: string) {
		const filePath = resolve(basePath, `${name}.mjml`);
		this.templates.set(name, readFileSync(filePath, 'utf-8'));
	}
}
