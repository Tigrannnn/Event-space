export interface DateRangeValue {
	from: Date;
	to: Date;
}

export interface DateRangePreset {
	key: string;
	label: string;
	getRange: () => DateRangeValue;
}

export interface NumberBounds {
	min: number;
	max: number;
}
