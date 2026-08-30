import { Metadata } from 'next';
import { cookies } from 'next/headers';
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
	let failure: unknown = null;

	try {
		user = await serverFetch('/users/me');
	} catch (error) {
		failure = error;
	}

	// redirect() throws its own control-flow error, so it has to stay out of the
	// try above; the log records why access was denied — the guard is silent
	// otherwise and the cause is invisible in production.
	if (!user || user.role !== 'ADMIN') {
		console.error('[admin-guard] denied', {
			cookies: (await cookies()).getAll().map(({ name }) => name),
			role: user?.role ?? null,
			failure: failure instanceof Error ? failure.message : failure,
		});
		redirect('/');
	}

	return <AdminShell>{children}</AdminShell>;
}
