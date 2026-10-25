export function centerInScroller(scroller: HTMLElement | null, item: HTMLElement | null): void {
	if (!scroller || !item) return;

	const scrollerBox = scroller.getBoundingClientRect();
	const itemBox = item.getBoundingClientRect();

	scroller.scrollTop += itemBox.top - scrollerBox.top - (scrollerBox.height - itemBox.height) / 2;
}

export function keepInView(scroller: HTMLElement | null, item: HTMLElement | null): void {
	if (!scroller || !item) return;

	const scrollerBox = scroller.getBoundingClientRect();
	const itemBox = item.getBoundingClientRect();

	if (itemBox.top < scrollerBox.top) {
		scroller.scrollTop += itemBox.top - scrollerBox.top;
		return;
	}

	if (itemBox.bottom > scrollerBox.bottom) {
		scroller.scrollTop += itemBox.bottom - scrollerBox.bottom;
	}
}
