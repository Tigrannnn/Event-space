'use client';

import { isFlatSkin } from '@/utils/skin';
import Link from 'next/link';
import Button from '@/components/ui/Buttons/Button';
import { ModalType, useModalStore } from '@/stores';
import {
	ArrowRight,
	CogIcon,
	Heart,
	LogOut,
	ShieldCheck,
	Ticket,
	User,
	UserCog,
} from 'lucide-react';
import { useConfirm } from '@/hooks/confirmModal';
import { SafeUserData } from '@event-space/shared';
import { useCurrentUser } from '@/features/users';
import { useLogout } from '@/features/auth';
import ProfileSkeleton from './ProfileSkeleton';
import PageState from '@/components/ui/PageState';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { localizePath } from '@/lib/i18n/config';
import { useTranslation } from '@/hooks/translation';
import { useLabels } from '@/hooks/labels/useLabels';
import { useSkin } from '@/providers/BrandProvider';

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
	const { USER_ROLE_LABELS } = useLabels();
	const confirm = useConfirm();
	const skin = useSkin();
	const isMinimal = isFlatSkin(skin);
	const isListing = skin === 'listing';
	const isSoft = skin === 'soft';

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

	if (isMinimal || isSoft) {
		const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();
		const rows = [
			{
				key: 'edit',
				icon: User,
				title: translate('profile.editProfile'),
				hint: translate('profile.updateNamePassword'),
				onClick: handleOpenEditProfile,
			},
			{
				key: 'bookings',
				icon: Ticket,
				title: translate('profile.myBookings'),
				hint: translate('profile.viewBookings'),
				href: localizePath('/bookings', navigation.locale),
			},
			{
				key: 'favorites',
				icon: Heart,
				title: translate('favorites.title'),
				hint: translate('favorites.subtitle'),
				href: localizePath('/favorites', navigation.locale),
			},
			...(user.role === 'ADMIN'
				? [
						{
							key: 'admin',
							icon: ShieldCheck,
							title: translate('profile.adminPanel'),
							hint: translate('profile.managePlatform'),
							href: localizePath('/admin/dashboard', navigation.locale),
						},
					]
				: []),
		];
		if (isSoft) {
			return (
				<div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:py-12 md:pb-14">
					<div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-md sm:p-8 dark:bg-gray-800">
						<div
							aria-hidden
							className="bg-primary/10 pointer-events-none absolute -top-16 -right-16 size-56 rounded-full"
						/>
						<div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
							<div className="bg-primary flex size-24 shrink-0 items-center justify-center rounded-full font-(family-name:--font-display) text-4xl font-bold text-white ring-4 ring-(--brand-accent)/40">
								{initial}
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-primary text-3xl font-bold break-words sm:text-4xl">{user.name}</h1>
								<div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
									{[user.email, user.phone].filter(Boolean).map((item) => (
										<span
											key={item}
											className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200"
										>
											{item}
										</span>
									))}
									<span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-sm font-bold">
										{USER_ROLE_LABELS[user.role]}
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
						{rows.map((row) => {
							const content = (
								<>
									<span className="bg-accent/10 text-accent flex size-12 shrink-0 items-center justify-center rounded-full">
										<row.icon className="size-6" strokeWidth={1.75} />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block font-(family-name:--font-display) text-lg font-bold text-gray-900 dark:text-white">
											{row.title}
										</span>
										<span className="block text-sm text-gray-600 dark:text-gray-400">{row.hint}</span>
									</span>
									<ArrowRight className="text-primary size-5 shrink-0" />
								</>
							);
							const tile =
								'flex w-full cursor-pointer items-center gap-4 rounded-3xl border border-gray-200/70 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800';

							return row.href ? (
								<Link key={row.key} href={row.href} className={tile}>
									{content}
								</Link>
							) : (
								<button key={row.key} type="button" onClick={row.onClick} className={tile}>
									{content}
								</button>
							);
						})}
					</div>

					<div className="mt-6 flex justify-center">
						<Button variant="secondary" onClick={handleLogout} disabled={isLoggingOut}>
							<LogOut className="size-4" />
							{isLoggingOut ? translate('profile.loggingOut') : translate('profile.logOut')}
						</Button>
					</div>
				</div>
			);
		}

		if (isListing) {
			return (
				<div className="pb-24 md:pb-10">
					<div className="bg-primary text-white">
						<div className="mx-auto flex max-w-[1336px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 sm:py-8 lg:px-8">
							<div className="text-primary flex size-16 shrink-0 items-center justify-center rounded-md bg-white text-2xl font-bold sm:size-20 sm:text-3xl">
								{initial}
							</div>
							<div className="min-w-0 flex-1">
								<h1 className="text-2xl font-bold break-words sm:text-3xl">{user.name}</h1>
								<p className="text-sm break-words text-white/85 sm:text-base">
									{[user.email, user.phone].filter(Boolean).join(' · ')}
								</p>
								<span className="mt-2 inline-block rounded bg-white/20 px-2 py-0.5 text-xs font-semibold">
									{USER_ROLE_LABELS[user.role]}
								</span>
							</div>
							<button
								type="button"
								onClick={handleLogout}
								disabled={isLoggingOut}
								className="flex items-center justify-center gap-2 rounded-md border border-white/60 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-50"
							>
								<LogOut className="size-4" />
								{isLoggingOut ? translate('profile.loggingOut') : translate('profile.logOut')}
							</button>
						</div>
					</div>

					<div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
						{rows.map((row) => {
							const content = (
								<>
									<span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-md">
										<row.icon className="size-6" strokeWidth={1.75} />
									</span>
									<span className="min-w-0 flex-1">
										<span className="block font-bold text-gray-900 dark:text-white">{row.title}</span>
										<span className="block text-sm text-gray-600 dark:text-gray-400">{row.hint}</span>
									</span>
									<ArrowRight className="text-primary size-5 shrink-0" />
								</>
							);
							const tile =
								'flex w-full cursor-pointer items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900';

							return row.href ? (
								<Link key={row.key} href={row.href} className={tile}>
									{content}
								</Link>
							) : (
								<button key={row.key} type="button" onClick={row.onClick} className={tile}>
									{content}
								</button>
							);
						})}
					</div>
				</div>
			);
		}

		const rowClassName =
			'flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-gray-50 sm:py-5 dark:hover:bg-neutral-900';

		return (
			<div className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:py-14 md:pb-14">
				<div className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-5">
					<div className="bg-primary flex size-16 shrink-0 items-center justify-center rounded-full text-2xl font-semibold text-white sm:size-20 sm:text-3xl">
						{initial}
					</div>
					<div className="min-w-0">
						<h1 className="text-2xl font-semibold tracking-tight break-words text-gray-900 sm:text-3xl dark:text-white">
							{user.name}
						</h1>
						<p className="text-sm break-words text-gray-500 sm:text-base dark:text-gray-400">
							{[user.email, user.phone].filter(Boolean).join(' · ')}
						</p>
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{USER_ROLE_LABELS[user.role]}</p>
					</div>
				</div>

				<div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-neutral-800 dark:border-neutral-800">
					{rows.map((row) => {
						const content = (
							<>
								<span className="flex min-w-0 items-center gap-4">
									<row.icon className="size-6 shrink-0 text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
									<span className="min-w-0">
										<span className="block font-medium text-gray-900 dark:text-white">{row.title}</span>
										<span className="block text-sm text-gray-500 dark:text-gray-400">{row.hint}</span>
									</span>
								</span>
								<ArrowRight className="size-5 shrink-0 text-gray-400" />
							</>
						);

						return row.href ? (
							<Link key={row.key} href={row.href} className={rowClassName}>
								{content}
							</Link>
						) : (
							<button key={row.key} type="button" onClick={row.onClick} className={rowClassName}>
								{content}
							</button>
						);
					})}
				</div>

				<button
					type="button"
					onClick={handleLogout}
					disabled={isLoggingOut}
					className="mt-8 flex items-center gap-2 text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900 disabled:opacity-50 dark:text-gray-300 dark:hover:text-white"
				>
					<LogOut className="size-4" />
					{isLoggingOut ? translate('profile.loggingOut') : translate('profile.logOut')}
				</button>
			</div>
		);
	}

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
							<h1 className="text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">{user.name}</h1>
							<p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">{user.email}</p>
							{user.phone && (
								<p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">{user.phone}</p>
							)}
							<span className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 capitalize dark:bg-blue-900 dark:text-blue-200">
								<UserCog className="mr-1 h-3 w-3" />
								{USER_ROLE_LABELS[user.role]}
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
							className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 sm:p-4 dark:hover:bg-gray-700/50"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 sm:h-10 sm:w-10 dark:bg-blue-900/30">
									<User className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">
										{translate('profile.editProfile')}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{translate('profile.updateNamePassword')}
									</p>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
						</button>

						<Link
							href={localizePath('/bookings', navigation.locale)}
							className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 sm:p-4 dark:hover:bg-gray-700/50"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 sm:h-10 sm:w-10 dark:bg-green-900/30">
									<Ticket className="h-4 w-4 text-green-600 sm:h-5 sm:w-5 dark:text-green-400" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">
										{translate('profile.myBookings')}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{translate('profile.viewBookings')}
									</p>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
						</Link>

						<Link
							href={localizePath('/favorites', navigation.locale)}
							className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 sm:p-4 dark:hover:bg-gray-700/50"
						>
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 sm:h-10 sm:w-10 dark:bg-rose-900/30">
									<Heart className="h-4 w-4 text-rose-600 sm:h-5 sm:w-5 dark:text-rose-400" />
								</div>
								<div className="text-left">
									<p className="font-medium text-gray-900 dark:text-white">{translate('favorites.title')}</p>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										{translate('favorites.subtitle')}
									</p>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
						</Link>

						{user.role === 'ADMIN' && (
							<Link
								href={localizePath('/admin/dashboard', navigation.locale)}
								className="flex w-full cursor-pointer items-center justify-between p-3 transition-colors hover:bg-gray-50 sm:p-4 dark:hover:bg-gray-700/50"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 sm:h-10 sm:w-10 dark:bg-violet-900/30">
										<ShieldCheck className="h-4 w-4 text-violet-600 sm:h-5 sm:w-5 dark:text-violet-300" />
									</div>
									<div className="text-left">
										<p className="font-medium text-gray-900 dark:text-white">
											{translate('profile.adminPanel')}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{translate('profile.managePlatform')}
										</p>
									</div>
								</div>
								<ArrowRight className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5" />
							</Link>
						)}
					</div>
				</div>

				{/* Account Actions */}
				<div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="border-b border-gray-100 p-3 sm:p-4 dark:border-gray-700">
						<h2 className="text-base font-semibold text-gray-900 sm:text-lg dark:text-white">
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
