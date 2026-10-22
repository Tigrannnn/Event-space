import { MailTemplateService } from './mail-template.service';

describe('MailTemplateService', () => {
	it('renders the rescheduled template as HTML instead of the plain text fallback', async () => {
		const service = new MailTemplateService();
		service.onModuleInit();

		const html = await service.render('occurrence-rescheduled', {
			TITLE: 'Дата тура изменилась',
			GREETING: 'Здравствуйте, Ара!',
			BODY: 'Тур «Поход на Арагац» перенесён с 10 ноября на 24 ноября.',
			REASON_BLOCK:
				'<mj-text align="left" font-size="15px" color="#6b7280">Причина: Перевал закрыт</mj-text>',
			KEEPS_BOOKING: 'Бронь остаётся в силе.',
			CANT_MAKE: 'Если дата не подходит — ответьте на это письмо.',
			SUPPORT: 'Вопросы — ответом на это письмо.',
			SIGNOFF: 'С уважением,',
			SIGNATURE: 'Event Space',
		});

		expect(html).toContain('<html');
		expect(html).toContain('Поход на Арагац');
		expect(html).toContain('Перевал закрыт');
		expect(html).toContain('Бронь остаётся в силе.');
		expect(html).toContain('Если дата не подходит');
	});
});
