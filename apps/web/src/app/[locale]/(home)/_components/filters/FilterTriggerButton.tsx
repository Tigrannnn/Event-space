'use client';

import type React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/primitives/button';

interface FilterTriggerButtonProps extends React.ComponentProps<typeof Button> {
    isActive?: boolean;
    showChevron?: boolean;
}

export function FilterTriggerButton({
    className,
    isActive = false,
    showChevron = true,
    children,
    variant = 'outline',
    size = 'sm',
    ...props
}: FilterTriggerButtonProps) {
    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            className={cn(
                'h-9 shrink-0 rounded-xl bg-background px-4 border border-primary/50 text-sm font-medium shadow-sm transition-all hover:bg-accent/30 hover:text-accent-foreground',
                isActive && 
                    'border-primary/60 bg-primary/10 text-primary ring-1 ring-primary/60 dark:bg-primary/10',
                className,
            )}
            {...props}
        >
            <span className="truncate">{children}</span>
            {showChevron && <ChevronDownIcon className="ml-2 size-3.5 opacity-60" />}
        </Button>
    );
}

interface CategoryPillProps extends React.ComponentProps<'button'> {
    isActive?: boolean;
}

export function CategoryPill({ className, isActive = false, children, ...props }: CategoryPillProps) {
    return (
        <button
            type="button"
            className={cn(
                'h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-all duration-200 shadow-sm',
                isActive
                    ?
                      'border-primary bg-primary font-semibold'
                    :
                      'border-primary/50 bg-background hover:border-primary/40 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}