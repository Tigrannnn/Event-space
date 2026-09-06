'use client';

import { useRef } from 'react';

interface DateTimeFieldProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	inputClassName: string;
}

function splitDateTime(value: string): { date: string; time: string } {
	if (!value) {
		return { date: '', time: '' };
	}
	const [date, time] = value.split('T');
	return { date: date ?? '', time: (time ?? '').slice(0, 5) };
}

function combineDateTime(date: string, time: string): string {
	if (!date) {
		return '';
	}
	return `${date}T${time || '00:00'}`;
}

export default function DateTimeField({
	value,
	onChange,
	disabled,
	inputClassName,
}: DateTimeFieldProps) {
	const { date, time } = splitDateTime(value);

	const dateInputRef = useRef<HTMLInputElement | null>(null);

	const timeInputRef = useRef<HTMLInputElement | null>(null);

	return (
		// Native date/time inputs have a min-content width they refuse to go below
		// (~141px and ~96px), so on a phone-width card they blow the grid open and
		// push the time field outside the border. Stacked until there is room; then
		// the date gets the larger share, since "дд.мм.гггг" plus its picker icon
		// needs more than "--:--".
		<div className="grid grid-cols-1 gap-2 sm:grid-cols-[3fr_2fr]">
			<input
				ref={dateInputRef}
				type="date"
				value={date}
				disabled={disabled}
				onClick={() => dateInputRef.current?.showPicker?.()}
				onChange={(event) => onChange(combineDateTime(event.target.value, time))}
				className={inputClassName}
			/>
			<input
				ref={timeInputRef}
				type="time"
				value={time}
				disabled={disabled}
				onClick={() => timeInputRef.current?.showPicker?.()}
				onChange={(event) => onChange(combineDateTime(date, event.target.value))}
				className={inputClassName}
			/>
		</div>
	);
}
