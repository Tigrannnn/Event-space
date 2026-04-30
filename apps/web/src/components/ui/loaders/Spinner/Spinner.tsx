import React from 'react';

export default function Spinner() {
	return (
		<div className="flex flex-col items-center gap-4">
			<div className="border-t-primary h-10 w-10 animate-spin rounded-full border-4 border-gray-100" />
		</div>
	);
}
