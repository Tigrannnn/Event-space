import { KeyboardEvent } from 'react';

export interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
	placeholder?: string;
}
