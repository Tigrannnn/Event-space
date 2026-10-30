import { cn } from '@/utils/cn';
import type { AuthHint } from '@/hooks/authHint/useAuthHint';

interface AuthSkeletonProps {
	/** Who was here last time; a first visit is drawn as a guest. */
	hint: AuthHint;
	/** Pills for a signed-in visitor (favorites, bookings, profile) and for a guest (log in, sign up). */
	userCount?: number;
	guestCount?: number;
	/** The header sits on a brand-coloured band, where grey would look like a hole. */
	onDark?: boolean;
	className?: string;
}

/**
 * Stands where the sign-in and profile buttons will be while it is not yet known who is
 * visiting, so the header does not jump when the answer arrives after a refresh.
 */
export function AuthSkeleton({
	hint,
	userCount = 3,
	guestCount = 2,
	onDark = false,
	className,
}: AuthSkeletonProps) {
	const count = hint === 'user' ? userCount : guestCount;

	return (
		<div aria-hidden className={cn('flex items-center gap-2', className)}>
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className={cn(
						'h-9 w-24 animate-pulse rounded-full',
						onDark ? 'bg-white/25' : 'bg-gray-200 dark:bg-neutral-800',
					)}
				/>
			))}
		</div>
	);
}
