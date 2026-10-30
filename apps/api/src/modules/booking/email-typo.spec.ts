import { suggestEmailCorrection } from '@event-space/shared';

describe('suggesting a fix for a mistyped email', () => {
	it.each([
		['anna@gmial.com', 'anna@gmail.com'],
		['anna@gmail.con', 'anna@gmail.com'],
		['anna@gmaill.com', 'anna@gmail.com'],
		['anna@mail.ry', 'anna@mail.ru'],
		['Anna@Yahho.com', 'anna@yahoo.com'],
		['  anna@hotmial.com ', 'anna@hotmail.com'],
	])('turns %s into %s', (typed, fixed) => {
		expect(suggestEmailCorrection(typed)).toBe(fixed);
	});

	it.each(['anna@gmail.com', 'anna@mail.ru', 'anna@acme.am', 'anna@company.co.uk'])(
		'leaves %s alone',
		(typed) => {
			expect(suggestEmailCorrection(typed)).toBeNull();
		},
	);

	it('says nothing while the address is still being typed', () => {
		expect(suggestEmailCorrection('')).toBeNull();
		expect(suggestEmailCorrection('anna')).toBeNull();
		expect(suggestEmailCorrection('anna@')).toBeNull();
		expect(suggestEmailCorrection('@gmail.com')).toBeNull();
	});

	it('does not turn a short domain into half the internet', () => {
		expect(suggestEmailCorrection('anna@abc.ru')).toBeNull();
	});
});
