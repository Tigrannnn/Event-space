'use client';

import { MAX_CANCELLATION_REASON_LENGTH, type CancellationReasons } from '@event-space/shared';
import { useTranslation } from '@/hooks/translation';

export const REASON_LOCALES = [
	{ value: 'ru', label: '🇷🇺 Ru', googleCode: 'ru' },
	{ value: 'en', label: '🇬🇧 En', googleCode: 'en' },
	{ value: 'hy', label: '🇦🇲 Hy', googleCode: 'hy' },
] as const;

type ReasonLocale = (typeof REASON_LOCALES)[number]['value'];

interface CancellationReasonFieldProps {
	reasons: CancellationReasons;
	noReason: boolean;
	disabled?: boolean;
	onReasonsChange: (reasons: CancellationReasons) => void;
	onNoReasonChange: (noReason: boolean) => void;
}

function buildTranslateUrl(sourceCode: string, targetCode: string, text: string): string {
	const params = new URLSearchParams({ sl: sourceCode, tl: targetCode, text, op: 'translate' });
	return `https://translate.google.com/?${params.toString()}`;
}

export default function CancellationReasonField({
	reasons,
	noReason,
	disabled,
	onReasonsChange,
	onNoReasonChange,
}: CancellationReasonFieldProps) {
	const translate = useTranslation();

	const findSource = (target: ReasonLocale) =>
		REASON_LOCALES.find((l) => l.value !== target && reasons[l.value]?.trim());

	return (
		<div className="mt-4 space-y-3">
			<div className="space-y-1.5">
				<label className="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="radio"
						name="cancel-reason-mode"
						checked={!noReason}
						onChange={() => onNoReasonChange(false)}
						disabled={disabled}
					/>
					{translate('admin.cancelReasonWith')}
				</label>
				<label className="flex cursor-pointer items-center gap-2 text-sm">
					<input
						type="radio"
						name="cancel-reason-mode"
						checked={noReason}
						onChange={() => onNoReasonChange(true)}
						disabled={disabled}
					/>
					{translate('admin.cancelReasonNone')}
				</label>
			</div>

			{noReason ? (
				<p className="text-xs text-amber-600 dark:text-amber-400">
					{translate('admin.cancelReasonNoneHint')}
				</p>
			) : (
				<>
					<p className="text-xs text-gray-500 dark:text-gray-400">
						{translate('admin.cancelReasonHint')}
					</p>
					{REASON_LOCALES.map((locale) => {
						const value = reasons[locale.value] ?? '';
						const source = findSource(locale.value);

						return (
							<div key={locale.value} className="space-y-1">
								<div className="flex items-center justify-between gap-2">
									<span className="text-xs font-medium text-gray-500">{locale.label}</span>
									{source && !value.trim() && (
										<a
											href={buildTranslateUrl(
												source.googleCode,
												locale.googleCode,
												reasons[source.value] ?? '',
											)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary text-xs font-medium hover:underline"
										>
											{translate('admin.cancelReasonTranslate')}
										</a>
									)}
								</div>
								<textarea
									value={value}
									onChange={(event) => onReasonsChange({ ...reasons, [locale.value]: event.target.value })}
									maxLength={MAX_CANCELLATION_REASON_LENGTH}
									disabled={disabled}
									rows={2}
									className="focus:border-primary w-full resize-y rounded-md border border-gray-500 bg-transparent px-3 py-2 text-sm text-gray-900 outline-none dark:text-gray-100"
								/>
							</div>
						);
					})}
				</>
			)}
		</div>
	);
}
