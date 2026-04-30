import { LucideIcon } from 'lucide-react';

export interface InfoCardProps {
	icon: LucideIcon;
	label: string;
	value: string;
	iconColor?: string;
}

export function InfoCard({ icon: Icon, label, value, iconColor = 'text-accent' }: InfoCardProps) {
	return (
		<div className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-sm sm:rounded-2xl sm:p-4 dark:bg-gray-800 dark:shadow-gray-900/20">
			<Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor} mb-2 sm:mb-3`} />
			<span className="text-[11px] font-medium tracking-wide text-gray-500 uppercase sm:text-xs dark:text-gray-400">
				{label}
			</span>
			<span className="text-[13px] font-bold text-gray-800 sm:text-sm dark:text-gray-200">
				{value}
			</span>
		</div>
	);
}
