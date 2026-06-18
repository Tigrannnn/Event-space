/**
 * Formats booking reference number to display format.
 * Converts number to 6-digit format with # prefix (e.g., #100142)
 * @param ref - The reference number to format
 * @returns Formatted reference string or "—" if null/undefined
 */
export function formatBookingReference(ref: number | null | undefined): string {
	if (!ref) return '—';
	return `#${String(ref).padStart(6, '0')}`;
}
