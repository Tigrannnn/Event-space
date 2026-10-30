import { MailTemplateService } from './mail-template.service';
import { mailSkinVariables, resolveMailSkin } from './mail-skin';
import { buildBrandLogoBlock, type MailBrand } from './mail-brand';
import type { BrandSkin } from '@event-space/shared';

const SKINS: BrandSkin[] = ['classic', 'minimal', 'listing', 'soft', 'market', 'drawer'];

const VARIABLES = {
	TITLE: 'Подтверждение',
	INTRO: 'Введите код',
	CODE: '123456',
	EXPIRY: '15 минут',
	IGNORE_NOTE: 'Если это были не вы — проигнорируйте письмо.',
	BRAND_NAME: 'Event Space',
	BRAND_LOGO: '',
	BRAND_TITLE: 'Event Space',
	BRAND_FOOTER: 'footer',
	BRAND_PRIMARY: '#1a7000',
};

describe('mail skins', () => {
	const service = new MailTemplateService();
	service.onModuleInit();

	it.each(SKINS)('renders every placeholder for the %s skin', async (skin) => {
		const html = await service.render('verification', {
			...VARIABLES,
			...mailSkinVariables(skin, '#1a7000'),
		});

		expect(html).toContain('123456');
		expect(html).not.toMatch(/\{\{\s*[A-Z_]+\s*\}\}/);
	});

	it('keeps the classic frame for a letter rendered without a brand', async () => {
		const html = await service.render('verification', VARIABLES);

		expect(html).toContain('border-radius:40px');
		expect(html).toContain('#1b4c00');
	});

	it('gives the listing skin square corners and a strip of the brand colour on top', async () => {
		const html = await service.render('verification', {
			...VARIABLES,
			...mailSkinVariables('listing', '#1a7000'),
		});

		expect(html).toContain('border-radius:6px');
		expect(html).toContain('background:#1a7000');
		expect(html).not.toContain('border-radius:40px');
	});

	it('sets the soft skin headings in a serif face and keeps the brand colour', async () => {
		const html = await service.render('verification', {
			...VARIABLES,
			...mailSkinVariables('soft', '#1a7000'),
		});

		expect(html).toContain('Georgia');
		expect(html).toContain('border-radius:32px');
	});

	it('outlines the card in the skins that are drawn with borders', async () => {
		const outlined = await service.render('verification', {
			...VARIABLES,
			...mailSkinVariables('market', '#1a7000'),
		});
		const plain = await service.render('verification', {
			...VARIABLES,
			...mailSkinVariables('classic', '#1a7000'),
		});

		expect(outlined).toContain('border:1px solid #e5e7eb');
		expect(plain).not.toContain('border:1px solid #e5e7eb');
	});

	it('falls back to classic for a skin it does not know', () => {
		expect(resolveMailSkin('nonsense' as BrandSkin)).toBe('classic');
	});

	it('aligns the logo with the header of the skin', () => {
		const brand = (skin: BrandSkin): MailBrand => ({
			name: 'Event Space',
			siteUrl: 'https://example.am',
			logoUrl: 'https://example.am/logo.png',
			colorPrimary: '#1a7000',
			colorAccent: '#008391',
			skin,
		});

		expect(buildBrandLogoBlock(brand('listing'))).toContain('align="left"');
		expect(buildBrandLogoBlock(brand('listing'))).toContain('border-radius="6px"');
		expect(buildBrandLogoBlock(brand('classic'))).toContain('align="center"');
	});
});
