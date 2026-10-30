'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
	SearchHistoryItem,
	SearchSuggestedCategory,
	SearchSuggestedEvent,
} from '@event-space/shared';
import { useCurrentUser } from '@/features/users';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { searchApi } from '../api/search.api';

const MIN_QUERY_LENGTH = 2;
const TYPING_DELAY_MS = 200;

export type SearchItem =
	| { kind: 'history'; key: string; history: SearchHistoryItem }
	| { kind: 'event'; key: string; event: SearchSuggestedEvent }
	| { kind: 'category'; key: string; category: SearchSuggestedCategory }
	| { kind: 'submit'; key: string; query: string };

function useTypingDelay(value: string): string {
	const [delayed, setDelayed] = useState(value);

	useEffect(() => {
		const timer = setTimeout(() => setDelayed(value), TYPING_DELAY_MS);
		return () => clearTimeout(timer);
	}, [value]);

	return delayed;
}

interface UseSearchBoxParams {
	value: string;
	setValue: (value: string) => void;
	submit: (value: string) => void;
}

/**
 * Everything the suggestion list under a search field needs: what to offer (recent searches and
 * recommended tours while the field is empty, matching tours and categories while it is not),
 * which row the arrow keys are on, and what each row does when chosen.
 */
export function useSearchBox({ value, setValue, submit }: UseSearchBoxParams) {
	const navigation = useLocalizedNavigation();
	const queryClient = useQueryClient();
	const { data: user } = useCurrentUser();
	const containerRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);

	const text = value.trim();
	const typing = text.length >= MIN_QUERY_LENGTH;
	const delayed = useTypingDelay(text);

	const suggestions = useQuery({
		queryKey: ['search', 'suggestions', delayed],
		queryFn: () => searchApi.getSuggestions(delayed),
		enabled: open && typing && delayed.length >= MIN_QUERY_LENGTH,
		staleTime: 60 * 1000,
		placeholderData: keepPreviousData,
	});

	const recommended = useQuery({
		queryKey: ['search', 'recommended'],
		queryFn: () => searchApi.getRecommended(),
		enabled: open && !typing,
		staleTime: 5 * 60 * 1000,
	});

	const history = useQuery({
		queryKey: ['search', 'history'],
		queryFn: () => searchApi.getHistory(),
		enabled: open && !typing && Boolean(user),
		staleTime: 0,
	});

	const forget = useMutation({
		mutationFn: (id: string) => searchApi.forgetQuery(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['search', 'history'] }),
	});

	const items = useMemo<SearchItem[]>(() => {
		if (!typing) {
			return [
				...(user ? (history.data ?? []) : []).map((entry): SearchItem => ({
					kind: 'history',
					key: `h-${entry.id}`,
					history: entry,
				})),
				...(recommended.data ?? []).map((event): SearchItem => ({
					kind: 'event',
					key: `r-${event.id}`,
					event,
				})),
			];
		}

		return [
			...(suggestions.data?.events ?? []).map((event): SearchItem => ({
				kind: 'event',
				key: `e-${event.id}`,
				event,
			})),
			...(suggestions.data?.categories ?? []).map((category): SearchItem => ({
				kind: 'category',
				key: `c-${category.slug}`,
				category,
			})),
			{ kind: 'submit', key: 'submit', query: text },
		];
	}, [typing, user, history.data, recommended.data, suggestions.data, text]);

	useEffect(() => {
		setActiveIndex(-1);
	}, [items.length, typing]);

	useEffect(() => {
		if (!open) return;

		const closeOnOutsideClick = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', closeOnOutsideClick);
		return () => document.removeEventListener('mousedown', closeOnOutsideClick);
	}, [open]);

	// While the search is in use the page behind it is not: scrolling it would leave the
	// suggestions hanging over content the visitor has stopped looking at.
	useEffect(() => {
		if (!open) return;

		const { overflow, paddingRight } = document.body.style;
		const scrollbar = window.innerWidth - document.documentElement.clientWidth;

		document.body.style.overflow = 'hidden';
		if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

		return () => {
			document.body.style.overflow = overflow;
			document.body.style.paddingRight = paddingRight;
		};
	}, [open]);

	const close = useCallback(() => {
		setOpen(false);
		setActiveIndex(-1);
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
	}, []);

	const choose = useCallback(
		(item: SearchItem) => {
			close();

			if (item.kind === 'history') {
				setValue(item.history.query);
				submit(item.history.query);
			} else if (item.kind === 'submit') {
				submit(item.query);
			} else if (item.kind === 'event') {
				navigation.push(`/events/${item.event.id}`);
			} else {
				navigation.push(`/category/${item.category.slug}`);
			}
		},
		[close, navigation, setValue, submit],
	);

	const onKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				if (items.length === 0) return;
				event.preventDefault();
				setOpen(true);
				const step = event.key === 'ArrowDown' ? 1 : -1;
				setActiveIndex((current) => ((current + 1 + step + items.length + 1) % (items.length + 1)) - 1);
				return;
			}

			if (event.key === 'Escape') {
				close();
				return;
			}

			if (event.key === 'Enter') {
				const active = items[activeIndex];
				if (active) {
					event.preventDefault();
					choose(active);
				} else {
					close();
					submit(value);
				}
			}
		},
		[items, activeIndex, choose, close, submit, value],
	);

	return {
		containerRef,
		open,
		setOpen,
		typing,
		text,
		items,
		activeIndex,
		setActiveIndex,
		choose,
		onKeyDown,
		forgetHistory: (id: string) => forget.mutate(id),
		isLoading: typing ? suggestions.isFetching && !suggestions.data : false,
		nothingFound: typing && suggestions.isSuccess && items.length === 1,
	};
}

export type SearchBox = ReturnType<typeof useSearchBox>;
