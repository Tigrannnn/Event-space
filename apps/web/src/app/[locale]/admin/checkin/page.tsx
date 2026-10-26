import { Suspense } from 'react';
import CheckInForm from './_components/CheckInForm';

export default function CheckInPage() {
	return (
		<div className="space-y-6">
			<Suspense>
				<CheckInForm />
			</Suspense>
		</div>
	);
}
