export interface PriceBounds {
	min: number;
	max: number;
}

export interface DateRangeFilter {
	from: Date;
	to: Date;
}

export interface PriceRangeFilter {
	min: number;
	max: number;
}

export interface EventsFiltersState {
	categories: string[];
	dateRange: DateRangeFilter | null;
	guests: number | null;
	priceRange: PriceRangeFilter | null;
}

export interface EventsFiltersBarProps {
	categories: import('@event-space/shared').Category[];
	priceBounds: PriceBounds;
	filters: EventsFiltersState;
	onFiltersChange: (filters: EventsFiltersState) => void;
	isLoadingCategories?: boolean;
}
