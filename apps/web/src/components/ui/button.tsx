import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none transition-all disabled:pointer-events-none disabled:opacity-50 active:not-aria-[haspopup]:translate-y-px focus-visible:ring-3 focus-visible:ring-primary/40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-[var(--btn-icon-size,1rem)]',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
				outline:
					'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 aria-expanded:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
				secondary:
					'bg-gray-100 text-gray-900 hover:bg-gray-200 aria-expanded:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
				ghost:
					'hover:bg-gray-100 hover:text-gray-900 aria-expanded:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100',
				destructive:
					'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				xs: 'h-6 rounded-md px-2 text-xs [--btn-icon-size:0.75rem] in-data-[slot=button-group]:rounded-lg',
				sm: 'h-7 rounded-md px-2.5 text-[0.8rem] [--btn-icon-size:0.875rem] in-data-[slot=button-group]:rounded-lg',
				default: 'h-8 px-2.5',
				lg: 'h-9 px-2.5',
				icon: 'size-8',
				'icon-xs': 'size-6 rounded-md [--btn-icon-size:0.75rem] in-data-[slot=button-group]:rounded-lg',
				'icon-sm': 'size-7 rounded-md in-data-[slot=button-group]:rounded-lg',
				'icon-lg': 'size-9',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

function Button({
	className,
	variant = 'default',
	size = 'default',
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : 'button';

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
