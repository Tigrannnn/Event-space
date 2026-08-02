'use client';

import type { ReactNode } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/translation';
import { Button } from '@/components/ui/primitives/button';
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/primitives/sheet';

interface FiltersDrawerProps {
	activeCount: number;
	onApply: () => void;
	onReset: () => void;
	children: ReactNode;
	applyLabel: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	showTrigger?: boolean;
}

/**
 * Mobile shell for a set of filter controls: trigger, sheet, reset/apply footer.
 *
 * Deliberately knows nothing about the filters themselves — draft state belongs to the caller,
 * because each screen shapes its filters differently.
 */
export function FiltersDrawer({
	activeCount,
	onApply,
	onReset,
	children,
	applyLabel,
	open,
	onOpenChange,
	showTrigger = true,
}: FiltersDrawerProps) {
	const translate = useTranslation();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{showTrigger && (
				<SheetTrigger asChild>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-9 w-full rounded-lg border-gray-200/80 bg-white/90 font-medium shadow-sm md:hidden dark:bg-white/10 dark:text-white dark:border-gray-700/80"
					>
						<SlidersHorizontalIcon className="size-4 text-primary/80" />
						{activeCount > 0
							? `${translate('filters.filters')} · ${activeCount}`
							: translate('filters.filters')}
					</Button>
				</SheetTrigger>
			)}
			<SheetContent
				side="bottom"
				className="flex max-h-[80vh] overflow-y-auto flex-col rounded-t-3xl border-t border-gray-200/80 bg-gray-50/95 p-0 shadow-lg backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95"
				showCloseButton
			>
				<SheetHeader className="border-b border-gray-200/70 px-4 py-4 dark:border-gray-700/70">
					<SheetTitle>{translate('filters.filters')}</SheetTitle>
				</SheetHeader>

				<div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">{children}</div>

				<SheetFooter className="flex-row items-center justify-between border-t border-gray-200/70 bg-white/90 px-4 py-4 dark:border-gray-700/70 dark:bg-gray-900/90">
					<Button type="button" variant="ghost" onClick={onReset}>
						{translate('filters.reset')}
					</Button>
					<Button type="button" onClick={onApply}>
						{applyLabel}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
