'use client';

import Select from '@/components/ui/Select';
import { useSourceOptions } from './useSourceOptions';
import { useTranslation } from '@/hooks/translation';

const NONE = '__none__';

interface SourceSelectProps {
	value: string | null;
	onChange: (sourceId: string | null) => void;
	label: string;
	disabled?: boolean;
}

export default function SourceSelect({ value, onChange, label, disabled }: SourceSelectProps) {
	const translate = useTranslation();
	const sourceOptions = useSourceOptions();

	const options = [
		{ value: NONE, label: translate('admin.sourceUnspecified') },
		...sourceOptions,
	];

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-sm font-semibold">{label}</span>
			<Select
				value={value ?? NONE}
				onValueChange={(next) => onChange(next === NONE ? null : next)}
				disabled={disabled}
				className="w-full font-medium"
				options={options}
			/>
		</div>
	);
}
