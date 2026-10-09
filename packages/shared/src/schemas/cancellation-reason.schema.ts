import z from 'zod';
import { LocaleEnum, type Locale } from './locale.schema';

export const MAX_CANCELLATION_REASON_LENGTH = 500;

const ReasonText = z.string().trim().max(MAX_CANCELLATION_REASON_LENGTH).optional();

export const CancellationReasonsSchema = z.object({
	ru: ReasonText,
	en: ReasonText,
	hy: ReasonText,
});

export type CancellationReasons = z.infer<typeof CancellationReasonsSchema>;

export function pickCancellationReason(
	reasons: CancellationReasons | null | undefined,
	locale: Locale,
): string | undefined {
	return reasons?.[LocaleEnum.parse(locale)]?.trim() || undefined;
}

export function hasCancellationReason(reasons: CancellationReasons | null | undefined): boolean {
	return LocaleEnum.options.some((locale) => Boolean(reasons?.[locale]?.trim()));
}

export function compactCancellationReasons(
	reasons: CancellationReasons | null | undefined,
): CancellationReasons | undefined {
	if (!hasCancellationReason(reasons)) return undefined;

	const compact: CancellationReasons = {};
	for (const locale of LocaleEnum.options) {
		const text = reasons?.[locale]?.trim();
		if (text) compact[locale] = text;
	}
	return compact;
}
