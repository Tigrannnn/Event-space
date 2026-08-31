import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server.api';
import { SafeUserData } from '@event-space/shared';
import { getBrandForHost } from '@/config/brands';
import AdminShell from './_components/AdminShell';

export async function generateMetadata(): Promise<Metadata> {
	const brand = getBrandForHost((await headers()).get('host'));

	return {
		title: `Admin Panel | ${brand.name}`,
		description: 'Admin dashboard for managing events and users',
	};
}

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

	if (!user || user.role !== 'ADMIN') {
		redirect('/');
	}

	return <AdminShell>{children}</AdminShell>;
}
