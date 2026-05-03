export default function ProfileSkeleton() {
	return (
		<div className="min-h-screen px-4 py-12">
			<div className="mx-auto max-w-2xl">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
					<div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
					<div className="w-12" />
				</div>

				<div className="space-y-6">
					{/* Main Info Card */}
					<div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
						<div className="flex flex-col items-center border-b border-gray-50 bg-gray-50/50 p-8">
							{/* Avatar */}
							<div className="mb-4 h-24 w-24 animate-pulse rounded-full bg-gray-200" />
							<div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
							<div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
						</div>

						<div className="grid grid-cols-1 gap-6 p-8 sm:grid-cols-2">
							<div>
								<div className="mb-1 h-3 w-20 animate-pulse rounded bg-gray-200" />
								<div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
							</div>
							<div>
								<div className="mb-1 h-3 w-24 animate-pulse rounded bg-gray-200" />
								<div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
							</div>
						</div>
					</div>

					{/* Quick Actions Card */}
					<div className="rounded-3xl border border-gray-100 bg-white p-2 shadow-sm">
						<div className="p-4">
							<div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
						</div>

						<div className="space-y-1 p-2">
							{/* Action Item 1 */}
							<div className="flex w-full items-center justify-between rounded-xl bg-gray-50 p-4">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
									<div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
								</div>
								<div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
							</div>

							{/* Action Item 2 */}
							<div className="flex w-full items-center justify-between rounded-xl bg-gray-50 p-4">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200" />
									<div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
								</div>
								<div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
							</div>
						</div>
					</div>

					{/* Danger Zone */}
					<div className="rounded-3xl border border-red-100 bg-red-50/50 p-2 shadow-sm">
						<div className="p-4">
							<div className="h-3 w-28 animate-pulse rounded bg-red-200" />
						</div>

						<div className="p-2">
							<div className="flex w-full items-center justify-between rounded-xl bg-red-100/50 p-4">
								<div className="flex items-center gap-4">
									<div className="h-10 w-10 animate-pulse rounded-xl bg-red-200" />
									<div className="h-5 w-32 animate-pulse rounded bg-red-200" />
								</div>
								<div className="h-5 w-5 animate-pulse rounded bg-red-200" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
