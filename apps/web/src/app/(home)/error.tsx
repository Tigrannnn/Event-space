'use client';

export default function HomeError() {
	return (
		<div className="flex min-h-[85vh] items-center justify-center px-4 sm:px-6 lg:px-8">
			<div className="rounded-2xl border border-red-100 p-6 text-center sm:rounded-[2.5rem] sm:p-10">
				<p className="mb-2 text-lg font-black uppercase text-red-600 sm:text-xl">Error Loading Events</p>
				<p className="text-[15px] text-red-400 sm:text-sm">Please check your connection and try again.</p>
			</div>
		</div>
	);
}
