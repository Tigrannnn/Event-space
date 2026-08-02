'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import Button from '@/components/ui/Buttons/Button';
import { FiltersDrawer } from '@/components/filters';
import { useTranslation } from '@/hooks/translation';

interface AdminFilterBarProps {
	searchValue: string;
	onSearchValueChange: (value: string) => void;
	onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
	searchPlaceholder: string;
	isFetching?: boolean;
	activeCount: number;
	showReset: boolean;
	onReset: () => void;
	/** The filter controls — laid out in a row on desktop, stacked in a drawer on mobile. */
	children: ReactNode;
}

/**
 * Shared filter bar for the admin tables.
 *
 * Controls apply the moment they change, on both layouts — the drawer's button only dismisses
 * the sheet. Admin filters live in the URL, so a draft-then-apply step would just add a click
 * without buying anything.
 */
export default function AdminFilterBar({
	searchValue,
	onSearchValueChange,
	onSearchSubmit,
	searchPlaceholder,
	isFetching = false,
	activeCount,
	showReset,
	onReset,
	children,
}: AdminFilterBarProps) {
	const translate = useTranslation();
	const [drawerOpen, setDrawerOpen] = useState(false);

	const resetButton = showReset ? (
		<Button type="button" size="sm" variant="secondary" onClick={onReset}>
			<X className="h-4 w-4" />
			{translate('admin.reset')}
			{activeCount > 0 && ` · ${activeCount}`}
		</Button>
	) : null;

	return (
		<div className="flex flex-col gap-3 ">
			<form onSubmit={onSearchSubmit} className="flex min-w-0 flex-1 gap-2">
				<div className="relative min-w-0 flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<input
						value={searchValue}
						onChange={(event) => onSearchValueChange(event.target.value)}
						placeholder={searchPlaceholder}
						className="focus:border-primary border-primary/50 bg-background h-9 w-full rounded-xl border pr-3 pl-9 text-sm shadow-sm transition outline-none placeholder:text-gray-400"
					/>
				</div>
				<Button type="submit" size="sm" variant="secondary" disabled={isFetching}>
					{translate('header.search')}
				</Button>
			</form>

			<div className="hidden flex-wrap items-center gap-2 md:flex">
				{children}
				{resetButton}
			</div>

			<div className="md:hidden">
				<FiltersDrawer
					activeCount={activeCount}
					open={drawerOpen}
					onOpenChange={setDrawerOpen}
					onApply={() => setDrawerOpen(false)}
					onReset={() => {
						onReset();
						setDrawerOpen(false);
					}}
					applyLabel={translate('common.done')}
				>
					<div className="flex flex-col gap-3 [&>*]:w-full">{children}</div>
				</FiltersDrawer>
			</div>
		</div>
	);
}
