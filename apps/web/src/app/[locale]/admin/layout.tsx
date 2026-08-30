import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server.api';
import { SafeUserData } from '@event-space/shared';
import AdminShell from './_components/AdminShell';

export const metadata: Metadata = {
	title: 'Admin Panel | Event Space',
	description: 'Admin dashboard for managing events and users',
};

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	let user: SafeUserData | null = null;

	try {
		user = await serverFetch('/users/me');
	} catch {
		redirect('/');
	}

	if (user?.role !== 'ADMIN') {
		redirect('/');
	}

	return <AdminShell>{children}</AdminShell>;
}
