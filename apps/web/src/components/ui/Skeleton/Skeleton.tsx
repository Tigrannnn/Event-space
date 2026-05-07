'use client';

import { cn } from '@/utils/cn';

export interface SkeletonProps {
	className?: string;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}

export const Skeleton = ({ className, children, style }: SkeletonProps) => (
	<div
		className={cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-700', className)}
		style={style}
	>
		{children}
	</div>
);

// Text skeleton with multiple lines
export const SkeletonText = ({
	lines = 1,
	className,
	widths = ['100%'],
}: {
	lines?: number;
	className?: string;
	widths?: string[];
}) => (
	<div className={cn('space-y-2', className)}>
		{Array.from({ length: lines }).map((_, i) => (
			<Skeleton
				key={i}
				className="h-4"
				style={{ width: widths[i] || widths[widths.length - 1] || '100%' }}
			/>
		))}
	</div>
);

// Avatar skeleton
export const SkeletonAvatar = ({
	size = 'md',
	className,
}: {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}) => {
	const sizes = {
		sm: 'h-8 w-8',
		md: 'h-10 w-10',
		lg: 'h-16 w-16',
		xl: 'h-24 w-24',
	};
	return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
};

// Button skeleton
export const SkeletonButton = ({
	className,
	width = '100%',
}: {
	className?: string;
	width?: string;
}) => <Skeleton className={cn('h-10 rounded-lg', className)} style={{ width }} />;

// Card container skeleton
export const SkeletonCard = ({ children, className }: SkeletonProps) => (
	<div
		className={cn(
			'rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800',
			className,
		)}
	>
		{children}
	</div>
);

// List item skeleton with icon
export const SkeletonListItem = ({
	iconSize = 'md',
	lines = 2,
	className,
}: {
	iconSize?: 'sm' | 'md' | 'lg';
	lines?: number;
	className?: string;
}) => {
	const iconSizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };
	return (
		<div className={cn('flex items-center gap-3', className)}>
			<Skeleton className={cn('rounded-lg', iconSizes[iconSize])} />
			<div className="flex-1">
				<SkeletonText lines={lines} widths={['40%', '60%']} />
			</div>
			<Skeleton className="h-5 w-5 rounded" />
		</div>
	);
};
