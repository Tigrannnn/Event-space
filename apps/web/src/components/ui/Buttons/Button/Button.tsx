import { LoaderCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
	'relative flex cursor-pointer items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-accent hover:shadow-accent/30 disabled:hover:bg-primary disabled:shadow-none dark:shadow-primary/10',
				secondary:
					'border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white disabled:border-gray-300 disabled:hover:bg-white disabled:hover:text-primary dark:border-primary/70 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-primary dark:hover:text-white',
				danger:
					'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:shadow-red-600/30 disabled:hover:bg-red-500 disabled:shadow-none dark:shadow-red-500/10',
			},
			size: {
				xs: 'px-3 py-1 text-xs rounded-md',
				sm: 'px-4 py-2 text-sm rounded-lg',
				md: 'px-6 py-3 text-base rounded-xl sm:rounded-2xl',
				lg: 'px-8 py-4 text-lg rounded-xl sm:rounded-2xl',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
}

const Button = ({
	variant,
	size,
	children,
	onClick,
	disabled,
	isLoading,
	className,
	...props
}: ButtonProps) => {
	const isDisabled = disabled || isLoading;

	return (
		<button
			className={cn(buttonVariants({ variant, size }), className)}
			onClick={isDisabled ? undefined : onClick}
			disabled={isDisabled}
			aria-busy={isLoading}
			{...props}
		>
			{isLoading && <LoaderCircle className="h-4 w-4 animate-spin" />}
			{children}
		</button>
	);
};

export default Button;
