import Button from '@/components/ui/Buttons';
import { Home } from 'lucide-react';
import Link from 'next/link';
import PageState from '@/components/ui/PageState';

export default function NotFound() {
	return (
		<PageState className="from-primary/10 to-accent/10 bg-linear-to-br">
			<div className="max-w-md text-center">
				<h1 className="text-primary text-[120px] leading-none font-black sm:text-[150px] md:text-[180px]">
					404
				</h1>
				<h2 className="mb-4 text-2xl font-bold text-gray-800 sm:text-3xl dark:text-gray-200">
					Page Not Found
				</h2>
				<p className="mb-8 text-base text-gray-600 sm:text-lg dark:text-gray-400">
					Oops! The page you&apos;re looking for doesn&apos;t exist.
				</p>
				<Link href="/">
					<Button className="w-full">
						<Home className="h-5 w-5" />
						Go Home
					</Button>
				</Link>
			</div>
		</PageState>
	);
}
