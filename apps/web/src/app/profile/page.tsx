import { serverFetch } from '@/lib/server.api';
import { SafeUserData } from '@event-space/shared';
import ProfileContent from './ProfileContent';

export default async function ProfilePage() {
	let user: SafeUserData | null = null;

	try {
		user = await serverFetch('/users/me');
	} catch {
		user = null;
	}

	return <ProfileContent initialUser={user} />;
}
