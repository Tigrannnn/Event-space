'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import {
	getBannerTranslation,
	getCategoryTranslation,
	getEventTranslation,
	optimizeImageUrl,
	type Banner,
} from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import { useTranslation } from '@/hooks/translation';
import { useFormatDate } from '@/hooks/format';
import { useConfirm } from '@/hooks/confirmModal';
import { ModalType, useModalStore } from '@/stores';
import {
	useAdminBanners,
	useDeleteBanner,
	useReorderBanners,
} from '@/features/admin/hooks/useAdmin';
import { cn } from '@/utils/cn';

interface BannersListProps {
	initialBanners: Banner[];
}

export default function BannersList({ initialBanners }: BannersListProps) {
	const translate = useTranslation();
	const locale = translate.locale;
	const { formatDateTime } = useFormatDate();
	const { openModal } = useModalStore();
	const confirm = useConfirm();

	const { data } = useAdminBanners();
	const banners = data ?? initialBanners;

	const reorderBanners = useReorderBanners();
	const deleteBanner = useDeleteBanner();

	const move = (index: number, direction: -1 | 1) => {
		const next = index + direction;
		if (next < 0 || next >= banners.length) return;

		const ids = banners.map((banner) => banner.id);
		[ids[index], ids[next]] = [ids[next], ids[index]];

		reorderBanners.mutate(ids);
	};

	const handleDelete = async (banner: Banner) => {
		const title = getBannerTranslation(banner, locale).title || translate('admin.bannerUntitled');
		const confirmed = await confirm({
			title: translate('admin.deleteBanner'),
			message: `${translate('admin.deleteBannerMessage')} "${title}"`,
			confirmText: translate('admin.delete'),
			variant: 'danger',
		});

		if (confirmed) {
			deleteBanner.mutate(banner.id);
		}
	};

	const describeTarget = (banner: Banner): string => {
		switch (banner.targetType) {
			case 'EVENT':
				return banner.event
					? getEventTranslation({ translations: banner.event.translations }, locale).title
					: translate('admin.bannerTargetMissing');
			case 'CATEGORY':
				return banner.category
					? getCategoryTranslation(banner.category, locale).name
					: translate('admin.bannerTargetMissing');
			case 'URL':
				return banner.url ?? translate('admin.bannerTargetMissing');
		}
	};

	const describeSchedule = (banner: Banner): string => {
		if (!banner.startsAt && !banner.endsAt) return translate('admin.bannerScheduleAlways');

		const from = banner.startsAt ? formatDateTime(banner.startsAt) : '…';
		const to = banner.endsAt ? formatDateTime(banner.endsAt) : '…';

		return `${from} — ${to}`;
	};

	return (
		<div className="overflow-hidden rounded-lg border border-gray-500 shadow-sm">
			<div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
				<div>
					<p className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
						{translate('admin.banners')}
					</p>
					<p className="text-xs text-gray-500 sm:text-sm">{translate('admin.bannersHint')}</p>
				</div>
				<Button
					type="button"
					size="sm"
					className="max-sm:px-3 max-sm:py-1.5 max-sm:text-xs"
					onClick={() => openModal(ModalType.CreateBanner)}
				>
					<Plus className="h-4 w-4" />
					{translate('admin.createBanner')}
				</Button>
			</div>

			{banners.length === 0 ? (
				<p className="px-3 py-8 text-center text-gray-500 sm:px-5">
					{translate('admin.noBannersFound')}
				</p>
			) : (
				<ul className="divide-y divide-gray-200 dark:divide-gray-700">
					{banners.map((banner, index) => {
						const text = getBannerTranslation(banner, locale);

						return (
							<li
								key={banner.id}
								className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
							>
								<div className="relative aspect-16/5 w-full shrink-0 overflow-hidden rounded-lg sm:w-48">
									<Image
										src={optimizeImageUrl(banner.imageUrl)}
										alt=""
										fill
										sizes="200px"
										className="object-cover"
										unoptimized
									/>
								</div>

								<div className="min-w-0 flex-1 space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="truncate font-medium text-gray-900 dark:text-gray-100">
											{text.title || translate('admin.bannerUntitled')}
										</p>
										<span
											className={cn(
												'rounded-full px-2 py-0.5 text-xs font-semibold',
												banner.status === 'ACTIVE'
													? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
													: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
											)}
										>
											{banner.status === 'ACTIVE'
												? translate('admin.bannerStatusActive')
												: translate('admin.bannerStatusDraft')}
										</span>
									</div>
									<p className="truncate text-xs text-gray-500">{describeTarget(banner)}</p>
									<p className="text-xs text-gray-500">{describeSchedule(banner)}</p>
								</div>

								<div className="flex gap-2">
									<Button
										type="button"
										size="xs"
										variant="secondary"
										disabled={index === 0 || reorderBanners.isPending}
										onClick={() => move(index, -1)}
										aria-label={translate('admin.bannerMoveUp')}
									>
										<ArrowUp className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										size="xs"
										variant="secondary"
										disabled={index === banners.length - 1 || reorderBanners.isPending}
										onClick={() => move(index, 1)}
										aria-label={translate('admin.bannerMoveDown')}
									>
										<ArrowDown className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										size="xs"
										variant="secondary"
										onClick={() => openModal(ModalType.UpdateBanner, { banner })}
										aria-label={`${translate('admin.edit')}: ${text.title || translate('admin.bannerUntitled')}`}
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										type="button"
										size="xs"
										variant="danger"
										onClick={() => handleDelete(banner)}
										isLoading={deleteBanner.isPending && deleteBanner.variables === banner.id}
										aria-label={`${translate('admin.delete')}: ${text.title || translate('admin.bannerUntitled')}`}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
