import { KeyboardEvent } from 'react';

export interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
	onFocus?: () => void;
	placeholder?: string;
	/** Cast the page-darkening shadow while the search suggestions are open. */
	dimmed?: boolean;
}
