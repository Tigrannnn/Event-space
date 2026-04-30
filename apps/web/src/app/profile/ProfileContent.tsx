'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Buttons/Button';
import { ModalType, useModalStore } from '@/stores';
import { ArrowRight, CogIcon, LogOut, Ticket, Trash2, User, UserCog } from 'lucide-react';
import { useConfirm } from '@/hooks/confirmModal';
import { SafeUserData } from '@event-space/shared';
import { useCurrentUser, useDeleteCurrentUser } from '@/features/users';
import { useLogout } from '@/features/auth';
import ProfileSkeleton from './ProfileSkeleton';

interface ProfileContentProps {
	initialUser: SafeUserData | null;
}

export default function ProfileContent({ initialUser }: ProfileContentProps) {
	const { data: user, isLoading } = useCurrentUser({
		initialData: initialUser || undefined,
		enabled: !!initialUser,
	});
	const { mutate: deleteAccount, isPending: isDeleting } = useDeleteCurrentUser();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const { openModal } = useModalStore();
	const router = useRouter();
	const confirm = useConfirm();

	if (isLoading) {
		return <ProfileSkeleton />;
	}

	// Show login prompt for unauthenticated users
	if (!user) {
		return (
			<div className="flex min-h-[75vh] items-center justify-center px-4">
				<div className="mx-auto max-w-md text-center">
					{/* Icon */}
					<div className="bg-primary/10 shadow-primary/10 mx-auto mb-8 flex h-36 w-36 items-center justify-center rounded-full shadow-lg">
						<User className="text-primary h-16 w-16" strokeWidth={1.5} />
					</div>

					{/* Heading */}
					<h2 className="text-3xl font-black text-gray-900">Welcome Back!</h2>
					<p className="mt-3 text-lg text-gray-500">
						Sign in to access your profile, manage events, and more.
					</p>

					{/* CTA Buttons */}
					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Button variant="primary" size="lg" onClick={() => openModal(ModalType.Register)}>
							Create Account
						</Button>
						<Button
							variant="primary"
							size="lg"
							onClick={() => openModal(ModalType.Login)}
							className="shadow-primary/20 shadow-lg"
						>
							Log In
						</Button>
					</div>

					{/* Decorative bottom accent */}
					<div className="bg-primary/5 mx-auto mt-12 h-1 w-24 rounded-full" />
				</div>
			</div>
		);
	}

	const handleLogout = async () => {
		const isConfirmed = await confirm({
			title: 'Log Out',
			message: 'Are you sure you want to log out? You will need to sign in again.',
			confirmText: 'Yes, Log Out',
			cancelText: 'Cancel',
			variant: 'danger',
		});

		if (isConfirmed) {
			logout();
		}
	};

	const handleDeleteAccount = async () => {
		const isConfirmed = await confirm({
			title: 'Delete Account',
			message: 'Are you sure you want to delete your account? This action cannot be undone.',
			confirmText: 'Yes, Delete',
			cancelText: 'Cancel',
			variant: 'danger',
		});

		if (isConfirmed) {
			deleteAccount();
		}
	};

	const handleOpenEditProfile = () => {
		openModal(ModalType.EditProfile);
	};

	return (
		<div className="min-h-[calc(100vh-64px)">
			{/* Header */}
			<div className="bg-white shadow-sm dark:bg-gray-800">
				<div className="mx-auto max-w-3xl px-4 py-6">
					<div className="flex items-center gap-4">
						{(() => {
							const initials = user.image ? (
								<img src={user.image} alt={user.name} className="h-full w-full rounded-full" />
							) : user.name
								? user.name
										.split(' ')
										.map((n) => n[0])
										.join('')
										.toUpperCase()
								: user.email[0].toUpperCase();
							return (
								<div className="bg-primary flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-white shadow-lg ring-4 ring-white">
									{initials}
								</div>
							);
						})()}
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
							<p className="text-gray-500 dark:text-gray-400">{user.email}</p>
							<span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize dark:bg-blue-900 dark:text-blue-200">
								<UserCog className="mr-1 h-3 w-3" />
								{user.role.toLowerCase()}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
				{/* Settings */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="border-b border-gray-100 p-4 dark:border-gray-700">
						<h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
							<CogIcon className="h-5 w-5" />
							Settings
						</h2>
					</div>
					<div className="divide-y divide-gray-100 dark:divide-gray-700">
						<button
							onClick={handleOpenEditProfile}
							className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
									<User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">Edit Profile</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">Update your name and password</p>
								</div>
							</div>
							<ArrowRight className="h-5 w-5 text-gray-400" />
						</button>

						<button
							onClick={() => router.push('/bookings')}
							className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
									<Ticket className="h-5 w-5 text-green-600 dark:text-green-400" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">My Bookings</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">View your event bookings</p>
								</div>
							</div>
							<ArrowRight className="h-5 w-5 text-gray-400" />
						</button>
					</div>
				</div>

				{/* Account Actions */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="border-b border-gray-100 p-4 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h2>
					</div>
					<div className="space-y-3 p-4">
						<Button
							variant="secondary"
							className="w-full justify-start gap-2 border-red-800 hover:bg-red-900 dark:border-red-800 dark:hover:bg-red-900"
							onClick={handleLogout}
							disabled={isLoggingOut}
						>
							<LogOut className="h-4 w-4" />
							{isLoggingOut ? 'Logging out...' : 'Log Out'}
						</Button>

						<Button
							variant="secondary"
							className="w-full justify-start gap-2 border-red-800 hover:bg-red-900 dark:border-red-800 dark:hover:bg-red-900"
							onClick={handleDeleteAccount}
							disabled={isDeleting}
						>
							<Trash2 className="h-4 w-4" />
							{isDeleting ? 'Deleting...' : 'Delete Account'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
