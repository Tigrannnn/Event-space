'use client';

import Spinner from '../loaders/Spinner';

export default function LoadingScreen() {
	return (
		<div className="from-primary to-accent fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br">
			<div className="text-center">
				{/* Logo */}
				<div className="mb-6 rounded-2xl bg-white/20 px-6 py-4 backdrop-blur-md dark:bg-gray-900/50">
					<span className="text-primary text-4xl font-black tracking-tighter uppercase">
						Event<span className="text-accent">Space</span>
					</span>
				</div>

				{/* Spinner */}
				<Spinner />
			</div>
		</div>
	);
}
