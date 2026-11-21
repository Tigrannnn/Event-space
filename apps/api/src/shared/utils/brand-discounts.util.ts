import { getBrandForHost, isBrandModuleEnabled } from '@event-space/shared';

export function dateDiscountsEnabled(brandHost: string | null | undefined): boolean {
	return isBrandModuleEnabled(getBrandForHost(brandHost ?? null), 'dateDiscounts');
}

export function effectiveDateDiscount(
	percent: number | null | undefined,
	brandHost: string | null | undefined,
): number | null | undefined {
	return dateDiscountsEnabled(brandHost) ? percent : null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function isOccurrenceLike(value: Record<string, unknown>): boolean {
	return 'discountPercent' in value && 'maxParticipants' in value;
}

export function stripDateDiscounts(value: unknown): void {
	if (Array.isArray(value)) {
		for (const item of value) stripDateDiscounts(item);
		return;
	}

	if (!isPlainObject(value)) return;

	if (isOccurrenceLike(value)) value.discountPercent = null;

	for (const child of Object.values(value)) stripDateDiscounts(child);
}
