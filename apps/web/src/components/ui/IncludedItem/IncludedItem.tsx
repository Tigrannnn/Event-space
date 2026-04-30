import { CheckIcon } from '@/components/ui/Icons';

export interface IncludedItemProps {
	text: string;
}

export function IncludedItem({ text }: IncludedItemProps) {
	return (
		<div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-900/20">
			<CheckIcon className="text-primary h-6 w-6" />
			<span className="font-medium text-gray-700 dark:text-gray-200">{text}</span>
		</div>
	);
}
