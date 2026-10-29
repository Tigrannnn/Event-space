'use client';

import { Clock, Search, Tag, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BrandSkin, SearchSuggestedEvent } from '@event-space/shared';
import { useSkin } from '@/providers/BrandProvider';
import { useTranslation } from '@/hooks/translation';
import { useFormatCurrency, useFormatDate } from '@/hooks/format';
import { EventImageWithFallback } from '@/features/events/components/EventImage';
import { cn } from '@/utils/cn';
import type { SearchBox, SearchItem } from '../hooks/useSearchBox';

interface Look {
	panel: string;
	heading: string;
	row: string;
	rowActive: string;
	thumb: string;
	title: string;
	meta: string;
	price: string;
	icon: string;
	remove: string;
}

const LOOK: Record<BrandSkin, Look> = {
	classic: {
		panel:
			'rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800',
		heading:
			'px-5 pt-3 pb-1.5 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500',
		row: 'flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-left',
		rowActive: 'bg-gray-100 dark:bg-gray-700',
		thumb: 'rounded-xl',
		title: 'text-[15px] font-medium text-gray-900 dark:text-white',
		meta: 'text-xs text-gray-500 dark:text-gray-400',
		price: 'text-primary text-sm font-bold whitespace-nowrap',
		icon: 'text-gray-400',
		remove:
			'rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-white',
	},
	minimal: {
		panel:
			'rounded-lg border border-gray-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900',
		heading:
			'border-b border-gray-100 px-4 pt-3 pb-2 text-[11px] font-medium tracking-widest text-gray-500 uppercase dark:border-neutral-800 dark:text-gray-400',
		row: 'flex w-full cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-2.5 text-left last:border-b-0 dark:border-neutral-800',
		rowActive: 'bg-gray-50 dark:bg-neutral-800',
		thumb: 'rounded-sm',
		title: 'text-sm font-medium text-gray-900 dark:text-white',
		meta: 'text-xs text-gray-500 dark:text-gray-400',
		price: 'text-sm font-semibold whitespace-nowrap text-gray-900 tabular-nums dark:text-white',
		icon: 'text-gray-400',
		remove: 'p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white',
	},
	listing: {
		panel:
			'overflow-hidden rounded-md border border-gray-300 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900',
		heading:
			'bg-gray-50 px-4 py-2 text-sm font-bold text-gray-900 dark:bg-neutral-800 dark:text-white',
		row: 'flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left',
		rowActive: 'bg-primary/10',
		thumb: 'rounded',
		title: 'text-sm font-semibold text-gray-900 dark:text-white',
		meta: 'text-xs text-gray-600 dark:text-gray-400',
		price: 'text-sm font-bold whitespace-nowrap text-gray-900 dark:text-white',
		icon: 'text-primary',
		remove:
			'rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-neutral-700 dark:hover:text-white',
	},
	soft: {
		panel:
			'rounded-[1.75rem] bg-white p-2 shadow-2xl ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10',
		heading: 'text-primary px-4 pt-3 pb-1 font-(family-name:--font-display) text-base font-semibold',
		row: 'flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-left',
		rowActive: 'bg-primary/10',
		thumb: 'rounded-xl',
		title: 'text-[15px] font-medium text-gray-900 dark:text-white',
		meta: 'text-xs text-gray-500 dark:text-gray-400',
		price:
			'from-primary to-accent bg-linear-to-r bg-clip-text font-(family-name:--font-display) text-base font-bold whitespace-nowrap text-transparent',
		icon: 'text-primary',
		remove:
			'rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white',
	},
	market: {
		panel:
			'overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900',
		heading: 'px-4 pt-3 pb-1 text-base font-bold text-gray-900 dark:text-white',
		row: 'flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left',
		rowActive: 'bg-gray-100 dark:bg-neutral-800',
		thumb: 'rounded-lg',
		title: 'text-[15px] font-medium text-gray-900 dark:text-white',
		meta: 'text-xs text-gray-500 dark:text-gray-400',
		price: 'text-sm font-bold whitespace-nowrap text-gray-900 dark:text-white',
		icon: 'text-gray-400',
		remove:
			'rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-neutral-700 dark:hover:text-white',
	},
};

function pickName<T extends { locale: string }>(
	items: T[],
	locale: string,
	read: (item: T) => string,
): string {
	const match = items.find((item) => item.locale === locale) ?? items[0];
	return match ? read(match) : '';
}

function highlight(text: string, query: string): ReactNode {
	const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
	if (index < 0) return text;

	return (
		<>
			{text.slice(0, index)}
			<mark className="bg-transparent font-bold text-inherit">
				{text.slice(index, index + query.length)}
			</mark>
			{text.slice(index + query.length)}
		</>
	);
}

export function SearchDropdown({ box }: { box: SearchBox }) {
	const skin = useSkin();
	const look = LOOK[skin];
	const translate = useTranslation();
	const locale = translate.locale;
	const formatCurrency = useFormatCurrency();
	const { formatDateShort } = useFormatDate();

	if (!box.open || box.items.length === 0) return null;

	const eventRow = (item: Extract<SearchItem, { kind: 'event' }>, index: number) => {
		const event: SearchSuggestedEvent = item.event;
		const title = pickName(event.translations, locale, (t) => t.title);
		const place = pickName(event.translations, locale, (t) => t.location);
		const meta = [place, event.nextDate ? formatDateShort(event.nextDate) : ''].filter(Boolean);

		return (
			<Row key={item.key} look={look} box={box} item={item} index={index}>
				<span
					className={cn(
						'relative h-11 w-11 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700',
						look.thumb,
					)}
				>
					<EventImageWithFallback src={event.imageUrl ?? ''} alt={title} />
				</span>
				<span className="min-w-0 flex-1">
					<span className={cn('block truncate', look.title)}>
						{box.typing ? highlight(title, box.text) : title}
					</span>
					<span className={cn('block truncate', look.meta)}>{meta.join(' · ')}</span>
				</span>
				<span className={look.price}>{formatCurrency(event.price)}</span>
			</Row>
		);
	};

	const sections: { heading?: string; rows: ReactNode[] }[] = [];
	const push = (heading: string | undefined, node: ReactNode) => {
		const last = sections[sections.length - 1];
		if (last && last.heading === heading) last.rows.push(node);
		else sections.push({ heading, rows: [node] });
	};

	box.items.forEach((item, index) => {
		if (item.kind === 'history') {
			push(
				translate('search.recent'),
				<Row key={item.key} look={look} box={box} item={item} index={index}>
					<Clock className={cn('size-4 shrink-0', look.icon)} />
					<span className={cn('min-w-0 flex-1 truncate', look.title)}>{item.history.query}</span>
					<span
						role="button"
						tabIndex={-1}
						aria-label={translate('search.removeRecent')}
						title={translate('search.removeRecent')}
						onClick={(event) => {
							event.stopPropagation();
							box.forgetHistory(item.history.id);
						}}
						className={cn('cursor-pointer', look.remove)}
					>
						<X className="size-4" />
					</span>
				</Row>,
			);
		} else if (item.kind === 'event') {
			push(
				box.typing ? translate('search.tours') : translate('search.recommended'),
				eventRow(item, index),
			);
		} else if (item.kind === 'category') {
			push(
				translate('search.categories'),
				<Row key={item.key} look={look} box={box} item={item} index={index}>
					<Tag className={cn('size-4 shrink-0', look.icon)} />
					<span className={cn('min-w-0 flex-1 truncate', look.title)}>
						{highlight(
							pickName(item.category.translations, locale, (t) => t.name),
							box.text,
						)}
					</span>
				</Row>,
			);
		} else {
			push(
				undefined,
				<Row key={item.key} look={look} box={box} item={item} index={index}>
					<Search className={cn('size-4 shrink-0', look.icon)} />
					<span className={cn('min-w-0 flex-1 truncate', look.title)}>
						{translate('search.searchFor', { query: item.query })}
					</span>
				</Row>,
			);
		}
	});

	return (
		<div
			role="listbox"
			aria-label={translate('search.listLabel')}
			className={cn(
				'absolute top-full right-0 left-0 z-50 mt-2 max-h-[45dvh] overflow-y-auto text-left sm:max-h-[70dvh]',
				look.panel,
			)}
		>
			{box.nothingFound && (
				<p className={cn('px-5 py-3', look.meta)}>
					{translate('search.nothingFound', { query: box.text })}
				</p>
			)}
			{sections.map((section, index) => (
				<div key={`${section.heading ?? 'tail'}-${index}`}>
					{section.heading && <p className={look.heading}>{section.heading}</p>}
					{section.rows}
				</div>
			))}
		</div>
	);
}

function Row({
	look,
	box,
	item,
	index,
	children,
}: {
	look: Look;
	box: SearchBox;
	item: SearchItem;
	index: number;
	children: ReactNode;
}) {
	return (
		<div
			role="option"
			aria-selected={box.activeIndex === index}
			tabIndex={-1}
			onMouseEnter={() => box.setActiveIndex(index)}
			onClick={() => box.choose(item)}
			className={cn(look.row, box.activeIndex === index && look.rowActive)}
		>
			{children}
		</div>
	);
}
