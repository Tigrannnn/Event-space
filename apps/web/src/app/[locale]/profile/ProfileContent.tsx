'use client';

import Button from '@/components/ui/Buttons/Button';
import { ModalType, useModalStore } from '@/stores';
import { ArrowRight, CogIcon, Heart, LogOut, ShieldCheck, Ticket, User, UserCog } from 'lucide-react';
import { useConfirm } from '@/hooks/confirmModal';
import { SafeUserData } from '@event-space/shared';
import { useCurrentUser } from '@/features/users';
import { useLogout } from '@/features/auth';
import ProfileSkeleton from './ProfileSkeleton';
import PageState from '@/components/ui/PageState';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';

interface ProfileContentProps {
	initialUser: SafeUserData | null;
}

export default function ProfileContent({ initialUser }: ProfileContentProps) {
	const hasInitialUser = initialUser !== null;
	const { data: user, isLoading } = useCurrentUser({
		initialData: initialUser ?? undefined,
		enabled: hasInitialUser,
	});
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const { openModal } = useModalStore();
	const navigation = useLocalizedNavigation();
	const translate = useTranslation();
	const confirm = useConfirm();

	if (hasInitialUser && isLoading) {
		return <ProfileSkeleton />;
	}

	// Show login prompt for unauthenticated users
	if (!user) {
		return (
			<PageState
				icon={
					<div className="bg-primary/10 shadow-primary/10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-lg sm:mb-8 sm:h-36 sm:w-36">
						<User className="text-primary h-12 w-12 sm:h-16 sm:w-16" strokeWidth={1.5} />
					</div>
				}
				title={translate('profile.welcomeBack')}
				description={translate('profile.signInDescription')}
				actions={
					<>
						<Button variant="primary" size="lg" onClick={() => openModal(ModalType.Register)}>
							{translate('profile.createAccount')}
						</Button>
						<Button
							variant="primary"
							size="lg"
							onClick={() => openModal(ModalType.Login)}
							className="shadow-primary/20 shadow-lg"
						>
							{translate('auth.logIn')}
						</Button>
					</>
				}
			>
				<div className="bg-primary/5 mx-auto mt-10 h-1 w-24 rounded-full sm:mt-12" />
			</PageState>
		);
	}

	const handleLogout = async () => {
		const isConfirmed = await confirm({
			title: translate('profile.logOutTitle'),
			message: translate('profile.logOutMessage'),
			confirmText: translate('profile.yesLogOut'),
			cancelText: translate('profile.cancel'),
			variant: 'danger',
		});

		if (isConfirmed) {
			logout();
		}
	};

	const handleOpenEditProfile = () => {
		openModal(ModalType.EditProfile);
	};

	return (
		<div className="min-h-0">
			{/* Header */}
			<div className="bg-white shadow-sm dark:bg-gray-800">
				<div className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
					<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
						{(() => {
							const initials = user.name
								? user.name
										.split(' ')
										.map((n) => n[0])
										.join('')
										.toUpperCase()
								: user.email?.[0].toUpperCase();
							return (
								<div className="bg-primary flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-white shadow-lg ring-4 ring-white">
									{initials}
								</div>
							);
						})()}
						<div className="w-full text-center sm:flex-1 sm:text-left">
							<h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">{user.name}</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">{user.email}</p>
							{user.phone && (
								<p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">{user.phone}</p>
							)}
							<span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize dark:bg-blue-900 dark:text-blue-200">
								<UserCog className="mr-1 h-3 w-3" />
								{user.role.toLowerCase()}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-3xl space-y-4 px-4 py-4 sm:py-6">
				{/* Settings */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="border-b border-gray-100 p-3 sm:p-4 dark:border-gray-700">
						<h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
							<CogIcon className="h-5 w-5" />
							{translate('profile.settings')}
						</h2>
					</div>
					<div className="divide-y divide-gray-100 dark:divide-gray-700">
						<button
							onClick={handleOpenEditProfile}
							className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 sm:h-10 sm:w-10">
									<User className="h-4 w-4 text-blue-600 dark:text-blue-400 sm:h-5 sm:w-5" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">{translate('profile.editProfile')}</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{translate('profile.updateNamePassword')}
									</p>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
						</button>

						<button
							onClick={() => navigation.push('/bookings')}
							className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30 sm:h-10 sm:w-10">
									<Ticket className="h-4 w-4 text-green-600 dark:text-green-400 sm:h-5 sm:w-5" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">{translate('profile.myBookings')}</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">{translate('profile.viewBookings')}</p>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
						</button>

						<button
							onClick={() => navigation.push('/favorites')}
							className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30 sm:h-10 sm:w-10">
									<Heart className="h-4 w-4 text-rose-600 dark:text-rose-400 sm:h-5 sm:w-5" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">{translate('favorites.title')}</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{translate('favorites.subtitle')}
									</p>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
						</button>

						{user.role === 'ADMIN' && (
							<button
								onClick={() => navigation.push('/admin/dashboard')}
								className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 sm:p-4"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 sm:h-10 sm:w-10">
										<ShieldCheck className="h-4 w-4 text-violet-600 dark:text-violet-300 sm:h-5 sm:w-5" />
									</div>
									<div className="text-left">
										<p className="font-medium text-gray-900 dark:text-white">{translate('profile.adminPanel')}</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{translate('profile.managePlatform')}
										</p>
									</div>
								</div>
								<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
							</button>
						)}
					</div>
				</div>

				{/* Account Actions */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="border-b border-gray-100 p-3 sm:p-4 dark:border-gray-700">
						<h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
							{translate('profile.account')}
						</h2>
					</div>
					<div className="space-y-3 p-3 sm:p-4">
						<Button
							variant="secondary"
							className="w-full justify-start gap-2 border-red-800 hover:bg-red-900 dark:border-red-800 dark:hover:bg-red-900"
							onClick={handleLogout}
							disabled={isLoggingOut}
						>
							<LogOut className="h-4 w-4" />
							{isLoggingOut ? translate('profile.loggingOut') : translate('profile.logOut')}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
