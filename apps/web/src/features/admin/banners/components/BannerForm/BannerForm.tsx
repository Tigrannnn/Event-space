'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { getCategoryTranslation, type Banner } from '@event-space/shared';
import Button from '@/components/ui/Buttons/Button';
import Select from '@/components/ui/Select';
import { ModalHeader } from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/translation';
import { useCategories } from '@/features/categories/hooks/useCategories';
import EventSearchSelect from '@/features/admin/components/EventSearchSelect';
import type { MessageKey } from '@/lib/i18n/messages';
import { BannerFormSchema, type BannerFormValues } from './banner-form.schema';
import { mapBannerToFormValues } from './form-mappers';
import BannerImageField from './BannerImageField';

interface BannerFormProps {
	submitLabel: string;
	banner?: Banner;
	isPending: boolean;
	onCancel: () => void;
	onSubmit: (values: BannerFormValues) => void;
}

const AVAILABLE_LOCALES = [
	{ value: 'ru', label: '🇷🇺 Ru' },
	{ value: 'en', label: '🇬🇧 En' },
	{ value: 'hy', label: '🇦🇲 Hy' },
] as const;

const fieldClassName =
	'focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm text-gray-900 outline-none dark:text-gray-100';

export default function BannerForm({
	submitLabel,
	banner,
	isPending,
	onCancel,
	onSubmit,
}: BannerFormProps) {
	const translate = useTranslation();
	const errorText = (message?: string) => (message ? translate(message as MessageKey) : undefined);

	const { data: categories = [] } = useCategories();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<BannerFormValues>({
		resolver: zodResolver(BannerFormSchema),
		defaultValues: mapBannerToFormValues(banner),
	});

	const targetType = useWatch({ control, name: 'targetType' });
	const watchedTranslations = useWatch({ control, name: 'translations' }) ?? [];

	const {
		fields: translationFields,
		append: appendTranslation,
		remove: removeTranslation,
	} = useFieldArray({ control, name: 'translations' });

	const [activeTabIndex, setActiveTabIndex] = useState(0);

	const addedLocales = watchedTranslations.map((translation) => translation.locale);
	const localesToAdd = AVAILABLE_LOCALES.filter((locale) => !addedLocales.includes(locale.value));

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-4 sm:p-6">
			<ModalHeader
				title={banner ? translate('admin.updateBanner') : translate('admin.createBanner')}
				onClose={onCancel}
			/>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Controller
					control={control}
					name="image"
					render={({ field }) => (
						<BannerImageField
							label={translate('admin.bannerImage')}
							hint={translate('admin.bannerImageHint')}
							removeLabel={translate('admin.bannerRemoveImage')}
							value={field.value}
							onChange={field.onChange}
							aspectClassName="aspect-16/5"
							disabled={isPending}
						/>
					)}
				/>

				<Controller
					control={control}
					name="imageMobile"
					render={({ field }) => (
						<BannerImageField
							label={translate('admin.bannerMobileImage')}
							hint={translate('admin.bannerMobileImageHint')}
							removeLabel={translate('admin.bannerRemoveImage')}
							value={field.value}
							onChange={field.onChange}
							aspectClassName="aspect-16/9"
							disabled={isPending}
						/>
					)}
				/>
			</div>
			{errors.image && <p className="text-xs text-red-500">{errorText(errors.image.message)}</p>}

			<div className="space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						{translate('admin.translations')}
					</h3>
					<div className="flex flex-wrap items-center gap-2">
						{localesToAdd.map((locale) => (
							<Button
								key={locale.value}
								type="button"
								variant="secondary"
								className="h-8 px-3 text-xs whitespace-nowrap"
								disabled={isPending}
								onClick={() =>
									appendTranslation(
										{ locale: locale.value, title: '', subtitle: '', ctaLabel: '' },
										{ shouldFocus: false },
									)
								}
							>
								+ {locale.label}
							</Button>
						))}
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					{translationFields.map((field, index) => {
						const localeInfo = AVAILABLE_LOCALES.find((locale) => locale.value === field.locale);
						const hasError = Boolean(errors.translations?.[index]);
						const isActive = activeTabIndex === index;

						return (
							<div
								key={field.id}
								onClick={() => setActiveTabIndex(index)}
								className={`flex cursor-pointer items-center gap-2 rounded-t-lg border-x border-t border-b-0 px-3 py-2 transition-colors ${
									isActive
										? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
										: 'border-gray-200 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'
								} ${hasError ? 'border-b-2 border-red-500' : ''}`}
							>
								<span className={`text-sm font-medium ${hasError ? 'text-red-500' : ''}`}>
									{localeInfo?.label ?? field.locale}
								</span>
								{translationFields.length > 1 && (
									<button
										type="button"
										className="ml-1 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
										disabled={isPending}
										onClick={(event) => {
											event.stopPropagation();
											removeTranslation(index);
											if (activeTabIndex >= translationFields.length - 1 && activeTabIndex > 0) {
												setActiveTabIndex(activeTabIndex - 1);
											}
										}}
									>
										<XIcon className="h-3 w-3" />
									</button>
								)}
							</div>
						);
					})}
				</div>

				{(errors.translations?.message || errors.translations?.root?.message) && (
					<p className="text-xs text-red-500">
						{errorText(errors.translations?.message ?? errors.translations?.root?.message)}
					</p>
				)}

				{translationFields.length > 0 && activeTabIndex < translationFields.length && (
					<div
						key={translationFields[activeTabIndex].id}
						className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
					>
						<label className="space-y-1.5">
							<span className="text-sm font-semibold">{translate('admin.bannerTitle')}</span>
							<input
								{...register(`translations.${activeTabIndex}.title`)}
								className={fieldClassName}
								disabled={isPending}
							/>
							{errors.translations?.[activeTabIndex]?.title && (
								<p className="text-xs text-red-500">
									{errorText(errors.translations[activeTabIndex]?.title?.message)}
								</p>
							)}
						</label>

						<label className="space-y-1.5">
							<span className="text-sm font-semibold">{translate('admin.bannerSubtitle')}</span>
							<input
								{...register(`translations.${activeTabIndex}.subtitle`)}
								className={fieldClassName}
								disabled={isPending}
							/>
						</label>

						<label className="space-y-1.5">
							<span className="text-sm font-semibold">{translate('admin.bannerCtaLabel')}</span>
							<input
								{...register(`translations.${activeTabIndex}.ctaLabel`)}
								className={fieldClassName}
								disabled={isPending}
								placeholder={translate('admin.bannerCtaPlaceholder')}
							/>
						</label>
					</div>
				)}
			</div>

			<div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
				<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
					{translate('admin.bannerTarget')}
				</h3>

				<Controller
					control={control}
					name="targetType"
					render={({ field }) => (
						<Select
							value={field.value}
							onValueChange={field.onChange}
							disabled={isPending}
							className="w-full"
							options={[
								{ value: 'EVENT', label: translate('admin.bannerTargetEvent') },
								{ value: 'CATEGORY', label: translate('admin.bannerTargetCategory') },
								{ value: 'URL', label: translate('admin.bannerTargetUrl') },
							]}
						/>
					)}
				/>

				{targetType === 'EVENT' && (
					<Controller
						control={control}
						name="eventId"
						render={({ field }) => (
							<EventSearchSelect
								value={field.value ?? ''}
								onChange={(eventId: string) => field.onChange(eventId)}
								label={translate('admin.bannerTargetEvent')}
							/>
						)}
					/>
				)}

				{targetType === 'CATEGORY' && (
					<Controller
						control={control}
						name="categoryId"
						render={({ field }) => (
							<Select
								value={field.value ?? ''}
								onValueChange={field.onChange}
								disabled={isPending}
								className="w-full"
								options={[
									{ value: '', label: translate('admin.bannerTargetCategory') },
									...categories.map((category) => ({
										value: category.id,
										label: getCategoryTranslation(category, translate.locale).name,
									})),
								]}
							/>
						)}
					/>
				)}

				{targetType === 'URL' && (
					<input
						{...register('url')}
						className={fieldClassName}
						disabled={isPending}
						placeholder="https://"
					/>
				)}

				{(errors.eventId || errors.categoryId || errors.url) && (
					<p className="text-xs text-red-500">
						{errorText(
							errors.eventId?.message ?? errors.categoryId?.message ?? errors.url?.message,
						)}
					</p>
				)}
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.bannerStartsAt')}</span>
					<input
						type="datetime-local"
						{...register('startsAt')}
						className={fieldClassName}
						disabled={isPending}
					/>
				</label>

				<label className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.bannerEndsAt')}</span>
					<input
						type="datetime-local"
						{...register('endsAt')}
						className={fieldClassName}
						disabled={isPending}
					/>
					{errors.endsAt && (
						<p className="text-xs text-red-500">{errorText(errors.endsAt.message)}</p>
					)}
				</label>
			</div>

			<p className="text-xs text-gray-500">{translate('admin.bannerScheduleHint')}</p>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<label className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.bannerStatus')}</span>
					<Controller
						control={control}
						name="status"
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={isPending}
								className="w-full"
								options={[
									{ value: 'DRAFT', label: translate('admin.bannerStatusDraft') },
									{ value: 'ACTIVE', label: translate('admin.bannerStatusActive') },
								]}
							/>
						)}
					/>
				</label>

				<label className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.bannerTextAlign')}</span>
					<Controller
						control={control}
						name="textAlign"
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={isPending}
								className="w-full"
								options={[
									{ value: 'LEFT', label: translate('admin.bannerAlignLeft') },
									{ value: 'CENTER', label: translate('admin.bannerAlignCenter') },
									{ value: 'RIGHT', label: translate('admin.bannerAlignRight') },
								]}
							/>
						)}
					/>
				</label>

				<label className="space-y-1.5">
					<span className="text-sm font-semibold">{translate('admin.bannerTheme')}</span>
					<Controller
						control={control}
						name="theme"
						render={({ field }) => (
							<Select
								value={field.value}
								onValueChange={field.onChange}
								disabled={isPending}
								className="w-full"
								options={[
									{ value: 'DARK', label: translate('admin.bannerThemeDark') },
									{ value: 'LIGHT', label: translate('admin.bannerThemeLight') },
								]}
							/>
						)}
					/>
				</label>
			</div>

			<div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end dark:border-gray-700">
				<Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
					{translate('admin.cancel')}
				</Button>
				<Button type="submit" isLoading={isPending}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
