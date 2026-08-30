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
	} catch (error) {
		console.error('[admin-guard] /users/me failed:', error);
		redirect('/');
	}

	if (user?.role !== 'ADMIN') {
		console.error('[admin-guard] role mismatch, received:', JSON.stringify(user));
		redirect('/');
	}

	return <AdminShell>{children}</AdminShell>;
}
