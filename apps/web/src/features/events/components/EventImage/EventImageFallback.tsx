export function EventImageFallback({ alt }: { alt: string }) {
	return (
		<div className="from-primary to-accent flex h-full w-full items-center justify-center bg-linear-to-br sm:h-full">
			<div className="text-center text-white">
				<p className="mb-2 text-4xl">🎉</p>
				<p className="text-sm font-bold tracking-wide uppercase">{alt}</p>
			</div>
		</div>
	);
}
