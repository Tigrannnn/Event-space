import CheckInForm from './_components/CheckInForm';

export default function CheckInPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Check In
            </h1>
            <CheckInForm />
        </div>
    );
}