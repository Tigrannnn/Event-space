import type { CSSProperties, ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SelectOption {
	value: string;
	label: ReactNode;
	disabled?: boolean;
}

interface SelectProps extends Omit<
	SelectHTMLAttributes<HTMLSelectElement>,
	'children' | 'onChange' | 'size'
> {
	options?: SelectOption[];
	children?: ReactNode;
	onValueChange?: (value: string) => void;
	size?: 'sm' | 'md';
}

const selectSizes = {
	sm: 'h-9',
	md: 'h-10',
};

const selectArrowStyle: CSSProperties = {
	appearance: 'none',
	backgroundImage:
		"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
	backgroundPosition: 'right 0.75rem center',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '1rem',
};

export default function Select({
	options,
	children,
	onValueChange,
	className,
	size = 'md',
	style,
	...props
}: SelectProps) {
	return (
		<select
			{...props}
			style={{ ...selectArrowStyle, ...style }}
			onChange={(event) => onValueChange?.(event.target.value)}
			className={cn(
				'focus:border-primary cursor-pointer appearance-none rounded-md border border-gray-500 bg-transparent pr-10 pl-3 text-sm transition outline-none hover:border-gray-600 disabled:cursor-not-allowed disabled:opacity-60',
				selectSizes[size],
				className,
			)}
		>
			{options?.map((option) => (
				<option key={option.value} value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			))}
			{children}
		</select>
	);
}
