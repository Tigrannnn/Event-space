import { LoaderCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
	'relative flex cursor-pointer items-center justify-center gap-2 in-data-[skin=soft]:rounded-full in-data-[skin=soft]:sm:rounded-full font-bold transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 in-data-[skin=minimal]:font-semibold in-data-[skin=listing]:font-semibold in-data-[skin=minimal]:rounded-full in-data-[skin=listing]:rounded-md in-data-[skin=minimal]:sm:rounded-full in-data-[skin=listing]:sm:rounded-md',
	{
		variants: {
			variant: {
				primary:
					'bg-primary text-white shadow-lg shadow-primary/20 in-data-[skin=soft]:shadow-md in-data-[skin=soft]:hover:bg-primary in-data-[skin=soft]:hover:brightness-90 hover:bg-accent hover:shadow-accent/30 disabled:hover:bg-primary disabled:shadow-none dark:shadow-primary/10 in-data-[skin=minimal]:shadow-none in-data-[skin=listing]:shadow-none in-data-[skin=minimal]:hover:shadow-none in-data-[skin=listing]:hover:shadow-none in-data-[skin=minimal]:hover:brightness-90 in-data-[skin=listing]:hover:brightness-90',
				secondary:
					'border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white disabled:border-gray-300 disabled:hover:bg-white disabled:hover:text-primary dark:border-primary/70 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-primary dark:hover:text-white in-data-[skin=minimal]:border-0 in-data-[skin=minimal]:bg-gray-100 in-data-[skin=minimal]:text-gray-900 in-data-[skin=minimal]:hover:bg-gray-200 in-data-[skin=minimal]:hover:text-gray-900 in-data-[skin=minimal]:dark:bg-neutral-800 in-data-[skin=minimal]:dark:text-white in-data-[skin=minimal]:dark:hover:bg-neutral-700 in-data-[skin=minimal]:dark:hover:text-white in-data-[skin=listing]:border in-data-[skin=listing]:border-primary in-data-[skin=listing]:bg-transparent in-data-[skin=listing]:text-primary in-data-[skin=listing]:hover:bg-primary/10 in-data-[skin=listing]:hover:text-primary in-data-[skin=listing]:dark:border-gray-500 in-data-[skin=listing]:dark:bg-transparent in-data-[skin=listing]:dark:text-gray-100 in-data-[skin=listing]:dark:hover:bg-white/10 in-data-[skin=listing]:dark:hover:text-white in-data-[skin=soft]:border in-data-[skin=soft]:border-gray-300 in-data-[skin=soft]:bg-white in-data-[skin=soft]:text-gray-900 in-data-[skin=soft]:shadow-sm in-data-[skin=soft]:hover:border-primary in-data-[skin=soft]:hover:bg-white in-data-[skin=soft]:hover:text-primary in-data-[skin=soft]:dark:border-gray-600 in-data-[skin=soft]:dark:bg-gray-800 in-data-[skin=soft]:dark:text-gray-100 in-data-[skin=soft]:dark:hover:border-primary in-data-[skin=soft]:dark:hover:bg-gray-800 in-data-[skin=soft]:dark:hover:text-white',
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
