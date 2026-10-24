import { reviewTokenSecret, signReviewToken, verifyReviewToken } from './review-token';

const SECRET = 'a-secret-long-enough-to-be-real';
const BOOKING = '550e8400-e29b-41d4-a716-446655440001';
const NOW = Date.parse('2026-10-25T10:00:00.000Z');
const HOUR = 60 * 60 * 1000;

describe('review link', () => {
	const token = signReviewToken(BOOKING, NOW + HOUR, SECRET);

	it('lets its own booking through', () => {
		expect(verifyReviewToken(BOOKING, token, SECRET, NOW)).toBe(true);
	});

	it('proves nothing about another booking', () => {
		expect(verifyReviewToken('another-booking', token, SECRET, NOW)).toBe(false);
	});

	it('stops working once it expires', () => {
		expect(verifyReviewToken(BOOKING, token, SECRET, NOW + 2 * HOUR)).toBe(false);
	});

	it('cannot be stretched by editing the date in it', () => {
		const [, signature] = token.split('.');
		const stretched = `${NOW + 100 * HOUR}.${signature}`;

		expect(verifyReviewToken(BOOKING, stretched, SECRET, NOW + 2 * HOUR)).toBe(false);
	});

	it('is worthless under a different key', () => {
		expect(verifyReviewToken(BOOKING, token, 'some-other-secret', NOW)).toBe(false);
	});

	it('refuses junk instead of throwing', () => {
		expect(verifyReviewToken(BOOKING, undefined, SECRET, NOW)).toBe(false);
		expect(verifyReviewToken(BOOKING, '', SECRET, NOW)).toBe(false);
		expect(verifyReviewToken(BOOKING, 'nonsense', SECRET, NOW)).toBe(false);
		expect(verifyReviewToken(BOOKING, '.abc', SECRET, NOW)).toBe(false);
		expect(verifyReviewToken(BOOKING, `${NOW + HOUR}.short`, SECRET, NOW)).toBe(false);
	});
});

describe('reviewTokenSecret', () => {
	it('prefers the dedicated secret', () => {
		expect(reviewTokenSecret('dedicated', 'jwt')).toBe('dedicated');
	});

	it('derives a key of its own when there is none, never the auth secret itself', () => {
		const derived = reviewTokenSecret(undefined, 'jwt-secret');

		expect(derived).not.toBe('jwt-secret');
		expect(derived).toBe(reviewTokenSecret('   ', 'jwt-secret'));
	});
});
