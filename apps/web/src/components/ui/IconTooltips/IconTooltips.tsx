'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TARGET = '[data-tooltip]';
const SHOW_DELAY_MS = 250;
const GAP = 8;
const EDGE = 8;

interface Tip {
	label: string;
	rect: DOMRect;
}

function labelOf(element: HTMLElement): string | null {
	return element.dataset.tooltip?.trim() || null;
}

function hideNativeTitle(element: HTMLElement) {
	const title = element.getAttribute('title');
	if (title === null) return;
	element.dataset.tooltipTitle = title;
	element.removeAttribute('title');
}

function restoreNativeTitle(element: HTMLElement) {
	const title = element.dataset.tooltipTitle;
	if (title === undefined) return;
	element.setAttribute('title', title);
	delete element.dataset.tooltipTitle;
}

export default function IconTooltips() {
	const [tip, setTip] = useState<Tip | null>(null);
	const currentRef = useRef<HTMLElement | null>(null);
	const timerRef = useRef<number | undefined>(undefined);

	useEffect(() => {
		const hide = () => {
			window.clearTimeout(timerRef.current);
			if (currentRef.current) restoreNativeTitle(currentRef.current);
			currentRef.current = null;
			setTip(null);
		};

		const show = (element: HTMLElement, delay: number) => {
			const label = labelOf(element);
			if (!label) return;

			hide();
			hideNativeTitle(element);
			currentRef.current = element;
			timerRef.current = window.setTimeout(() => {
				if (currentRef.current === element && element.isConnected) {
					setTip({ label, rect: element.getBoundingClientRect() });
				}
			}, delay);
		};

		const targetOf = (event: Event) =>
			event.target instanceof Element ? event.target.closest<HTMLElement>(TARGET) : null;

		const onPointerOver = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			const element = targetOf(event);
			if (element === currentRef.current) return;
			if (!element) return hide();
			show(element, SHOW_DELAY_MS);
		};

		const onPointerOut = (event: PointerEvent) => {
			const element = currentRef.current;
			if (!element) return;
			const next = event.relatedTarget;
			if (next instanceof Node && element.contains(next)) return;
			hide();
		};

		const onFocusIn = (event: FocusEvent) => {
			const element = targetOf(event);
			if (!element || !element.matches(':focus-visible')) return;
			show(element, 0);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') hide();
		};

		const onScroll = (event: Event) => {
			const element = currentRef.current;
			if (!element) return;
			const scrolled = event.target;
			if (scrolled === document || (scrolled instanceof Node && scrolled.contains(element))) hide();
		};

		document.addEventListener('pointerover', onPointerOver);
		document.addEventListener('pointerout', onPointerOut);
		document.addEventListener('pointerdown', hide, true);
		document.addEventListener('focusin', onFocusIn);
		document.addEventListener('focusout', hide);
		document.addEventListener('keydown', onKeyDown);
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', hide);

		return () => {
			hide();
			document.removeEventListener('pointerover', onPointerOver);
			document.removeEventListener('pointerout', onPointerOut);
			document.removeEventListener('pointerdown', hide, true);
			document.removeEventListener('focusin', onFocusIn);
			document.removeEventListener('focusout', hide);
			document.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', hide);
		};
	}, []);

	if (!tip) return null;

	const place = (bubble: HTMLDivElement | null) => {
		if (!bubble) return;

		const { width, height } = bubble.getBoundingClientRect();
		const fitsAbove = tip.rect.top - GAP - height >= EDGE;
		const top = fitsAbove ? tip.rect.top - GAP - height : tip.rect.bottom + GAP;
		const centered = tip.rect.left + tip.rect.width / 2 - width / 2;
		const left = Math.min(Math.max(centered, EDGE), window.innerWidth - width - EDGE);

		bubble.style.left = `${left}px`;
		bubble.style.top = `${top}px`;
		bubble.style.visibility = 'visible';
	};

	return createPortal(
		<div
			ref={place}
			role="tooltip"
			style={{ left: 0, top: 0, visibility: 'hidden' }}
			className="pointer-events-none fixed z-[100] max-w-xs rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg dark:bg-gray-700"
		>
			{tip.label}
		</div>,
		document.body,
	);
}
