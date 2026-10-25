export const DISCOUNT_PERCENT_MIN = 1;
export const DISCOUNT_PERCENT_MAX = 100;

const MINOR_UNITS = 100;

export type QuoteLineKind = 'BASE' | 'DISCOUNT';

export interface QuoteLine {
	kind: QuoteLineKind;
	label: string;
	amount: number;
}

export interface Quote {
	unitPrice: number;
	baseUnitPrice: number;
	discountPercent: number;
	lines: QuoteLine[];
	total: number;
	baseTotal: number;
}

export interface QuotedPrice {
	price: number | string;
	discountPercent?: number | null;
}

export interface QuoteParty {
	quantity: number;
}

export interface FrozenQuote {
	amount: number | string;
	baseAmount?: number | string | null;
	discountPercent?: number | null;
	quantity: number;
}

function toMinor(value: number | string): number {
	const asNumber = Number(value);
	return Number.isFinite(asNumber) ? Math.round(asNumber * MINOR_UNITS) : 0;
}

function fromMinor(minor: number): number {
	return minor / MINOR_UNITS;
}

function positiveQuantity(quantity: number): number {
	const whole = Math.trunc(quantity);
	return whole > 0 ? whole : 1;
}

export function normalizeDiscountPercent(value?: number | null): number {
	if (value === null || value === undefined || !Number.isFinite(value)) return 0;

	const whole = Math.trunc(value);
	if (whole < DISCOUNT_PERCENT_MIN) return 0;

	return Math.min(whole, DISCOUNT_PERCENT_MAX);
}

function discountedMinor(baseMinor: number, discountPercent: number): number {
	if (discountPercent <= 0) return baseMinor;

	return Math.floor((baseMinor * (100 - discountPercent)) / 100);
}

function buildLines(baseTotalMinor: number, totalMinor: number): QuoteLine[] {
	const lines: QuoteLine[] = [{ kind: 'BASE', label: 'base', amount: fromMinor(baseTotalMinor) }];

	if (totalMinor !== baseTotalMinor) {
		lines.push({
			kind: 'DISCOUNT',
			label: 'occurrenceDiscount',
			amount: fromMinor(totalMinor - baseTotalMinor),
		});
	}

	return lines;
}

export function quoteBooking(priced: QuotedPrice, party: QuoteParty): Quote {
	const quantity = positiveQuantity(party.quantity);
	const discountPercent = normalizeDiscountPercent(priced.discountPercent);

	const baseUnitMinor = toMinor(priced.price);
	const unitMinor = discountedMinor(baseUnitMinor, discountPercent);

	const baseTotalMinor = baseUnitMinor * quantity;
	const totalMinor = unitMinor * quantity;

	return {
		unitPrice: fromMinor(unitMinor),
		baseUnitPrice: fromMinor(baseUnitMinor),
		discountPercent: totalMinor === baseTotalMinor ? 0 : discountPercent,
		lines: buildLines(baseTotalMinor, totalMinor),
		total: fromMinor(totalMinor),
		baseTotal: fromMinor(baseTotalMinor),
	};
}

export function quoteFromBooking(booking: FrozenQuote): Quote {
	const quantity = positiveQuantity(booking.quantity);

	const totalMinor = toMinor(booking.amount);
	const baseTotalMinor =
		booking.baseAmount === null || booking.baseAmount === undefined
			? totalMinor
			: toMinor(booking.baseAmount);

	return {
		unitPrice: fromMinor(Math.round(totalMinor / quantity)),
		baseUnitPrice: fromMinor(Math.round(baseTotalMinor / quantity)),
		discountPercent:
			totalMinor === baseTotalMinor ? 0 : normalizeDiscountPercent(booking.discountPercent),
		lines: buildLines(baseTotalMinor, totalMinor),
		total: fromMinor(totalMinor),
		baseTotal: fromMinor(baseTotalMinor),
	};
}

export interface PricedOccurrence {
	date: Date | string;
	status?: string | null;
	discountPercent?: number | null;
}

export interface EventPricing {
	basePrice: number;
	fromPrice: number;
	maxDiscountPercent: number;
}

export function eventPricing(
	event: { price: number | string; occurrences?: PricedOccurrence[] | null },
	now: Date = new Date(),
): EventPricing {
	const baseMinor = toMinor(event.price);
	const upcoming = (event.occurrences ?? []).filter(
		(occurrence) =>
			occurrence.status !== 'CANCELLED' && new Date(occurrence.date).getTime() > now.getTime(),
	);

	let cheapestMinor = baseMinor;
	let maxDiscountPercent = 0;

	for (const occurrence of upcoming) {
		const percent = normalizeDiscountPercent(occurrence.discountPercent);
		const minor = discountedMinor(baseMinor, percent);

		if (minor < cheapestMinor) cheapestMinor = minor;
		if (percent > maxDiscountPercent) maxDiscountPercent = percent;
	}

	return {
		basePrice: fromMinor(baseMinor),
		fromPrice: fromMinor(cheapestMinor),
		maxDiscountPercent: cheapestMinor === baseMinor ? 0 : maxDiscountPercent,
	};
}
