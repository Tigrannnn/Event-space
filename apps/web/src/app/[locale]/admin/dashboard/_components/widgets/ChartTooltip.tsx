'use client';

import type { ReactNode } from 'react';

interface TooltipEntry {
	name?: ReactNode;
	value?: number | string;
	color?: string;
	dataKey?: string | number;
}

interface ChartTooltipProps {
	/** Injected by recharts when it clones this element. */
	active?: boolean;
	payload?: TooltipEntry[];
	label?: unknown;
	formatLabel: (label: unknown) => string;
	formatValue?: (value: number, name: string) => string;
}

/**
 * Tooltip rendered as a real component instead of recharts' default.
 *
 * The built-in tooltip is styled with inline CSS, which cannot express `dark:` variants — and
 * this project switches themes by class. Owning the markup is the only way it can follow the
 * theme rather than staying permanently light.
 */
export default function ChartTooltip({
	active,
	payload,
	label,
	formatLabel,
	formatValue,
}: ChartTooltipProps) {
	if (!active || !payload?.length) return null;

	return (
		<div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
			<p className="mb-1 text-xs font-semibold text-gray-900 dark:text-gray-100">
				{formatLabel(label)}
			</p>

			<ul className="space-y-0.5">
				{payload.map((entry) => {
					const name = typeof entry.name === 'string' ? entry.name : String(entry.dataKey ?? '');
					const numeric = Number(entry.value);

					return (
						<li key={String(entry.dataKey)} className="flex items-center gap-2 text-xs">
							<span
								className="size-2 shrink-0 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-gray-500 dark:text-gray-400">{name}:</span>
							<span className="font-medium text-gray-900 dark:text-gray-100">
								{formatValue ? formatValue(numeric, name) : numeric.toLocaleString()}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
