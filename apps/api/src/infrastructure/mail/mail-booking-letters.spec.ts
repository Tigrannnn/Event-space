import { MailService } from './mail.service';
import { MailTemplateService } from './mail-template.service';

function build() {
	const templates = new MailTemplateService();
	templates.onModuleInit();
	const sent: { html: string; text: string }[] = [];
	const config = { get: (key: string) => (key === 'FRONTEND_URL' ? 'https://site.am' : undefined), getOrThrow: () => 'x' };
	const service = new MailService(config as never, templates);
	(service as unknown as { deliver: (m: { html: string; text: string }) => Promise<void> }).deliver = async (m) => {
		sent.push(m);
	};
	return { service, sent };
}

const base = {
	to: 'a@b.c',
	locale: 'ru' as const,
	userName: 'Ани',
	referenceNumber: 42,
	eventTitle: 'Тур',
	occurrenceDate: new Date(Date.now() + 1e9),
	currency: 'AMD',
};

describe('letters about a change to a booking', () => {
	it('a cancellation lists the booking and leads to it by its own link', async () => {
		const { service, sent } = build();
		await service.sendBookingCancelledEmail({ ...base, quantity: 2, bookingId: 'b1', bookingLinkToken: 'tok' });

		expect(sent[0].html).toContain('Номер брони');
		expect(sent[0].html).toContain('#000042');
		expect(sent[0].html).toContain('/ru/bookings/b1?t=tok');
		expect(sent[0].html).toContain('На главную');
		expect(sent[0].text).toContain('https://site.am/ru/bookings/b1?t=tok');
		expect(sent[0].html).not.toContain('{{');
	});

	it('a change of guests leads to the booking too', async () => {
		const { service, sent } = build();
		await service.sendBookingQuantityChanged({
			...base,
			oldQuantity: 3,
			newQuantity: 2,
			newAmount: 20000,
			byOrganiser: false,
			bookingId: 'b1',
			bookingLinkToken: 'tok',
		});

		expect(sent[0].html).toContain('/ru/bookings/b1?t=tok');
		expect(sent[0].html).toContain('Количество мест');
	});

	it('without the booking link the buttons fall back to the list of bookings', async () => {
		const { service, sent } = build();
		await service.sendBookingCancelledEmail(base);

		expect(sent[0].html).toContain('/ru/bookings"');
		expect(sent[0].html).not.toContain('?t=');
	});
});
