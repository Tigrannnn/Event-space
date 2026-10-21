import { MailTemplateService } from './mail-template.service';
import { BOOKING_QUANTITY_CHANGED_STRINGS } from './mail-strings';

describe.each(['en', 'ru', 'hy'] as const)('booking changed email in %s', (locale) => {
	const strings = BOOKING_QUANTITY_CHANGED_STRINGS[locale];

	it('names the old and the new number of guests, the tour and the reference', () => {
		const line = strings.body('Tatev', '20 Oct 2026', '#000042', 3, 2, false);

		expect(line).toContain('Tatev');
		expect(line).toContain('#000042');
		expect(line).toContain('3');
		expect(line).toContain('2');
	});

	it('says who changed the booking', () => {
		const byClient = strings.body('Tatev', '20 Oct 2026', '#000042', 3, 2, false);
		const byOrganiser = strings.body('Tatev', '20 Oct 2026', '#000042', 3, 2, true);

		expect(byOrganiser).not.toBe(byClient);
	});

	it('states every amount it is given', () => {
		expect(strings.newTotal('20 000 AMD')).toContain('20 000 AMD');
		expect(strings.refund('9 700 AMD')).toContain('9 700 AMD');
		expect(strings.manualRefund('10 000 AMD')).toContain('10 000 AMD');
		expect(strings.paidByCard('10 000 AMD')).toContain('10 000 AMD');
		expect(strings.notAddedRefund('10 000 AMD')).toContain('10 000 AMD');
	});
});

describe('booking changed email template', () => {
	it('renders every block it is given and leaves no placeholder behind', async () => {
		const templates = new MailTemplateService();
		templates.onModuleInit();

		const html = await templates.render('booking-quantity-changed', {
			BRAND_NAME: 'Event Space',
			BRAND_LOGO: '',
			BRAND_TITLE: 'Event Space',
			BRAND_FOOTER: '',
			TITLE: 'Booking updated',
			GREETING: 'Dear Ani,',
			BODY: 'Booking #000042 was changed: 3 → 2 guests.',
			MONEY_BLOCKS:
				'<mj-text>The new total for the booking is 20 000 AMD.</mj-text><mj-text>A refund of 9 700 AMD is on its way.</mj-text>',
			SUPPORT: 'Reply to this email.',
			SIGNOFF: 'Best regards,',
			SIGNATURE: 'Event Space',
		});

		expect(html).toContain('Booking updated');
		expect(html).toContain('3 → 2 guests');
		expect(html).toContain('20 000 AMD');
		expect(html).toContain('9 700 AMD');
		expect(html).not.toContain('{{');
	});
});
