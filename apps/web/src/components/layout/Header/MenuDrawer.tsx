'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { usePreventScroll } from '@react-aria/overlays';
import { ArrowUpRight, Heart, Info, LogOut, Ticket, User, X } from 'lucide-react';
import { locales, localizePath } from '@/lib/i18n/config';
import { useLocalizedNavigation } from '@/lib/i18n/navigation';
import { useTranslation } from '@/hooks/translation';
import { useBrand } from '@/providers/BrandProvider';
import { useCurrentUser } from '@/features/users';
import { useLogout } from '@/features/auth';
import { useActiveBookingsCount } from '@/features/bookings/hooks/useBookings';
import { useFavoritesCount } from '@/features/favorites/hooks/useFavorites';
import { useHydrated } from '@/hooks/hydration/useHydrated';
import { ModalType, useModalStore } from '@/stores';
import { useEscapeKey, useFocusTrap } from '@/components/ui/Modal/hooks';
import { LANGUAGE_NAMES } from '@/components/ui/LanguageSwitcher/LanguageMenu';
import { cn } from '@/utils/cn';
import { useContactChannels } from './ContactTile';

const SECTION_TITLE =
	'px-1 text-xs font-bold tracking-widest text-gray-400 uppercase dark:text-gray-500';
const ROW =
	'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-800';

/** Mounted only while the panel is on screen, so the trap starts and ends with it. */
function FocusTrap({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
	useFocusTrap({ containerRef: containerRef as React.RefObject<HTMLElement> });
	return null;
}

interface MenuDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * The menu of the drawer skin: a sheet that slides in from the right edge and holds everything
 * that is not search: the account, the company pages, the contacts and the language.
 */
export default function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
	const translate = useTranslation();
	const brand = useBrand();
	const { locale, switchLocale } = useLocalizedNavigation();
	const { openModal } = useModalStore();
	const { data: user } = useCurrentUser();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();
	const bookingsCount = useActiveBookingsCount();
	const favoritesCount = useFavoritesCount();
	const channels = useContactChannels();
	const isHydrated = useHydrated();
	const panelRef = useRef<HTMLElement>(null);
	const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

	useEffect(() => setPortalTarget(document.body), []);

	useEscapeKey({ onClose, disabled: !isOpen });
	usePreventScroll({ isDisabled: !isOpen });

	if (!portalTarget || !isHydrated) return null;

	const openAuth = (type: ModalType.Login | ModalType.Register) => {
		onClose();
		openModal(type);
	};

	const link = (path: string, label: string, Icon: typeof Heart, count?: number) => (
		<Link key={path} href={localizePath(path, locale)} onClick={onClose} className={ROW}>
			<Icon className="text-primary size-5 shrink-0" />
			<span className="flex-1">{label}</span>
			{count ? (
				<span className="bg-primary rounded-full px-2 py-0.5 text-xs font-bold text-white">
					{count}
				</span>
			) : null}
		</Link>
	);

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						key="backdrop"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] bg-black/55"
						onClick={onClose}
						aria-hidden="true"
					/>
					<motion.aside
						key="panel"
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-label={translate('header.menu')}
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
						className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[26rem] flex-col overflow-y-auto bg-white p-5 shadow-2xl sm:rounded-l-[2rem] sm:p-6 dark:bg-neutral-950"
					>
						<FocusTrap containerRef={panelRef} />
						<div className="flex items-center justify-between">
							<span className="text-primary text-2xl font-black tracking-tight">{brand.name}</span>
							<button
								type="button"
								onClick={onClose}
								aria-label={translate('header.closeMenu')}
								className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-900 transition-colors hover:bg-gray-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
							>
								<X className="size-5" />
							</button>
						</div>

						<div className="mt-6 space-y-6">
							{user ? (
								<section className="space-y-1">
									<div className="bg-primary/10 mb-2 flex items-center gap-3 rounded-3xl p-4">
										<span className="bg-primary flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-black text-white">
											{user.name.trim().charAt(0).toUpperCase()}
										</span>
										<span className="min-w-0">
											<span className="block truncate font-bold text-gray-900 dark:text-white">
												{user.name}
											</span>
											<span className="block truncate text-xs text-gray-600 dark:text-gray-300">
												{user.email}
											</span>
										</span>
									</div>
									{link('/favorites', translate('header.favorites'), Heart, favoritesCount)}
									{link('/bookings', translate('header.bookings'), Ticket, bookingsCount)}
									{link('/profile', translate('header.profile'), User)}
								</section>
							) : (
								<section className="grid grid-cols-2 gap-3 md:hidden">
									<button
										type="button"
										onClick={() => openAuth(ModalType.Login)}
										className="h-12 cursor-pointer rounded-full border-2 border-gray-900 font-bold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-neutral-950"
									>
										{translate('header.logIn')}
									</button>
									<button
										type="button"
										onClick={() => openAuth(ModalType.Register)}
										className="bg-primary h-12 cursor-pointer rounded-full font-bold text-white transition-all hover:brightness-90"
									>
										{translate('header.signUp')}
									</button>
								</section>
							)}

							<section className="space-y-1">
								<h3 className={SECTION_TITLE}>{brand.name}</h3>
								{link('/about', translate('header.aboutUs'), Info)}
								<Link
									href={localizePath('/terms', locale)}
									onClick={onClose}
									className="block rounded-2xl px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								>
									{translate('legal.terms.title')}
								</Link>
								<Link
									href={localizePath('/privacy', locale)}
									onClick={onClose}
									className="block rounded-2xl px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								>
									{translate('legal.privacy.title')}
								</Link>
							</section>

							{channels.length > 0 && (
								<section className="space-y-1">
									<h3 className={SECTION_TITLE}>{translate('header.contactUs')}</h3>
									{channels.map(({ key, title, value, href, external, Icon }) => (
										<a
											key={key}
											href={href}
											{...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
											onClick={onClose}
											className={ROW}
										>
											<span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
												<Icon className="size-5" />
											</span>
											<span className="min-w-0 flex-1">
												<span className="block text-[15px] font-semibold">{translate(title)}</span>
												<span className="block truncate text-xs font-normal text-gray-500 dark:text-gray-400">
													{value}
												</span>
											</span>
											<ArrowUpRight className="size-4 shrink-0 text-gray-400" />
										</a>
									))}
								</section>
							)}

							<section className="space-y-2">
								<h3 className={SECTION_TITLE}>{translate('header.language')}</h3>
								<div className="flex flex-wrap gap-2">
									{locales.map((item) => (
										<button
											key={item}
											type="button"
											onClick={() => {
												onClose();
												switchLocale(item);
											}}
											aria-current={item === locale}
											className={cn(
												'h-10 cursor-pointer rounded-full px-4 text-sm font-bold transition-colors',
												item === locale
													? 'bg-gray-900 text-white dark:bg-white dark:text-neutral-950'
													: 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700',
											)}
										>
											{LANGUAGE_NAMES[item]}
										</button>
									))}
								</div>
							</section>
						</div>

						{user && (
							<button
								type="button"
								onClick={() => {
									onClose();
									logout();
								}}
								disabled={isLoggingOut}
								className="mt-8 flex cursor-pointer items-center gap-2 px-1 text-sm font-semibold text-gray-500 transition-colors hover:text-red-600 disabled:opacity-60 dark:text-gray-400"
							>
								<LogOut className="size-4" />
								{translate('profile.logOut')}
							</button>
						)}
					</motion.aside>
				</>
			)}
		</AnimatePresence>,
		portalTarget,
	);
}
