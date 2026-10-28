'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import type { BrandSkin } from '@event-space/shared';
import { useSkin } from '@/providers/BrandProvider';
import { useToastStore } from '@/stores/toastStore';
import type { Toast, ToastType } from '@/stores/toastStore';
import { cn } from '@/utils/cn';
import { ToastVariants, ToastVariantsByPlacement } from './animations';

const ICON: Record<ToastType, typeof Info> = {
	success: CheckCircle2,
	error: AlertCircle,
	info: Info,
};

const WRAPPER: Record<BrandSkin, string> = {
	classic: 'right-4 bottom-20 left-4 sm:right-8 sm:bottom-8 sm:left-auto',
	minimal:
		'right-4 bottom-20 left-4 items-center sm:right-auto sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2',
	listing: 'top-4 right-4 left-4 sm:top-20 sm:right-6 sm:left-auto sm:w-96',
	soft: 'right-4 bottom-24 left-4 sm:right-8 sm:bottom-8 sm:left-auto sm:w-96',
};

const VARIANTS: Record<BrandSkin, Variants> = {
	classic: ToastVariants,
	minimal: ToastVariantsByPlacement.fromBottom,
	listing: ToastVariantsByPlacement.fromTop,
	soft: ToastVariantsByPlacement.fromBottom,
};

function ClassicToast({ toast }: { toast: Toast }) {
	return (
		<div
			className={`rounded-full px-5 py-3 text-[15px] font-medium text-white shadow-lg sm:px-8 sm:py-4 sm:text-base ${toast.type === 'success' ? 'bg-primary' : ''} ${toast.type === 'error' ? 'bg-red-500' : ''} ${toast.type === 'info' ? 'bg-gray-700 dark:bg-gray-800' : ''} `}
		>
			{toast.message}
		</div>
	);
}

const MINIMAL_DOT: Record<ToastType, string> = {
	success: 'bg-emerald-400 dark:bg-emerald-500',
	error: 'bg-red-400 dark:bg-red-500',
	info: 'bg-gray-400',
};

function MinimalToast({ toast }: { toast: Toast }) {
	return (
		<div className="flex max-w-md items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-gray-900">
			<span className={cn('h-2 w-2 shrink-0 rounded-full', MINIMAL_DOT[toast.type])} />
			<span>{toast.message}</span>
		</div>
	);
}

const LISTING_STYLE: Record<ToastType, { stripe: string; icon: string }> = {
	success: { stripe: 'border-l-emerald-600', icon: 'text-emerald-600 dark:text-emerald-400' },
	error: { stripe: 'border-l-red-600', icon: 'text-red-600 dark:text-red-400' },
	info: { stripe: 'border-l-primary', icon: 'text-primary' },
};

function ListingToast({ toast }: { toast: Toast }) {
	const Icon = ICON[toast.type];
	const style = LISTING_STYLE[toast.type];

	return (
		<div
			className={cn(
				'flex items-start gap-3 rounded-md border border-l-4 border-gray-300 bg-white px-4 py-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900',
				style.stripe,
			)}
		>
			<Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon)} />
			<p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{toast.message}</p>
			<X className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
		</div>
	);
}

const SOFT_BUBBLE: Record<ToastType, string> = {
	success: 'from-primary to-accent bg-linear-to-br text-white',
	error: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
	info: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200',
};

function SoftToast({ toast }: { toast: Toast }) {
	const Icon = ICON[toast.type];

	return (
		<div className="flex items-center gap-3 rounded-3xl bg-white p-3 pr-5 shadow-xl ring-1 shadow-black/10 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
			<span
				className={cn(
					'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
					SOFT_BUBBLE[toast.type],
				)}
			>
				<Icon className="h-5 w-5" />
			</span>
			<p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{toast.message}</p>
		</div>
	);
}

const BODY: Record<BrandSkin, (props: { toast: Toast }) => React.ReactElement> = {
	classic: ClassicToast,
	minimal: MinimalToast,
	listing: ListingToast,
	soft: SoftToast,
};

export function ToastContainer() {
	const { toasts, removeToast } = useToastStore();
	const skin = useSkin();
	const Body = BODY[skin];

	return (
		<div
			className={cn(
				'pointer-events-none fixed z-50 flex flex-col gap-2',
				skin === 'listing' && 'sm:items-stretch',
				WRAPPER[skin],
			)}
		>
			<AnimatePresence>
				{toasts.map((toast) => (
					<motion.div
						layout
						key={toast.id}
						variants={VARIANTS[skin]}
						initial="initial"
						animate="animate"
						exit="exit"
						className="pointer-events-auto cursor-pointer"
						onClick={() => removeToast(toast.id)}
					>
						<Body toast={toast} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
