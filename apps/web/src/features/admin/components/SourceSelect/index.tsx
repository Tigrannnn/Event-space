'use client';

import Select from '@/components/ui/Select';
import { useAdminSources } from '@/features/admin/hooks/useAdmin';
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
	const { data } = useAdminSources();

	const options = [
		{ value: NONE, label: translate('admin.sourceUnspecified') },
		...(data?.sources ?? []).map((source) => ({ value: source.id, label: source.name })),
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
