'use client';

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

	return (
		<div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
			<input
				type="date"
				value={date}
				disabled={disabled}
				onChange={(event) => onChange(combineDateTime(event.target.value, time))}
				className={inputClassName}
			/>
			<input
				type="time"
				value={time}
				disabled={disabled}
				onChange={(event) => onChange(combineDateTime(date, event.target.value))}
				className={inputClassName}
			/>
		</div>
	);
}
