'use client';

import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Category } from '@event-space/shared';
import { CategoryFormSchema, type CategoryFormValues } from './category-form.schema';
import { mapCategoryToFormValues } from './form-mappers';
import Button from '@/components/ui/Buttons/Button';
import { ModalHeader } from '@/components/ui/Modal';
import { useState } from 'react';
import { useTranslation } from '@/hooks/translation';

interface CategoryFormProps {
	submitLabel: string;
	category?: Category;
	isPending: boolean;
	onCancel: () => void;
	onSubmit: (values: CategoryFormValues) => void;
}

const AVAILABLE_LOCALES = [
	{ value: 'ru', label: '🇷🇺 Ru' },
	{ value: 'en', label: '🇬🇧 En' },
	{ value: 'hy', label: '🇦🇲 Hy' },
] as const;

const fieldClassName =
	'focus:border-primary h-10 w-full rounded-md border border-gray-500 bg-transparent px-3 text-sm outline-none text-gray-900 dark:text-gray-100 ' +
	'[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function CategoryForm({
	submitLabel,
	category,
	isPending,
	onCancel,
	onSubmit,
}: CategoryFormProps) {
	const translate = useTranslation();

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CategoryFormValues>({
		resolver: zodResolver(CategoryFormSchema),
		defaultValues: mapCategoryToFormValues(category),
	});

	const watchedTranslations = useWatch({ control, name: 'translations' }) ?? [];

	const {
		fields: translationFields,
		append: appendTranslation,
		remove: removeTranslation,
	} = useFieldArray({
		control,
		name: 'translations',
	});

	const [activeTabIndex, setActiveTabIndex] = useState(0);

	const addedLocales = watchedTranslations.map((t) => t.locale);
	const availableLocalesToAdd = AVAILABLE_LOCALES.filter(
		(locale) => !addedLocales.includes(locale.value),
	);

	const hasTranslationErrors = (index: number) => {
		return !!errors.translations?.[index];
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-6">
			<ModalHeader
				title={category ? translate('admin.updateCategory') : translate('admin.createCategory')}
				onClose={onCancel}
			/>

			<div className="space-y-4">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
							{translate('admin.translations')}
						</h3>
						<div className="flex items-center gap-2">
							{availableLocalesToAdd.map((locale) => (
								<Button
									key={locale.value}
									type="button"
									variant="secondary"
									className="h-8 text-xs"
									disabled={isPending}
									onClick={() =>
										appendTranslation({
											locale: locale.value,
											name: '',
										})
									}
								>
									+ {locale.label}
								</Button>
							))}
						</div>
					</div>

					<div className="flex flex-wrap gap-2">
						{translationFields.map((field, index) => {
							const localeInfo = AVAILABLE_LOCALES.find((l) => l.value === field.locale);
							const hasError = hasTranslationErrors(index);
							const isActive = activeTabIndex === index;

							return (
								<div
									key={field.id}
									className={`flex cursor-pointer items-center gap-2 rounded-t-lg border-x border-t border-b-0 px-3 py-2 transition-colors ${
										isActive
											? 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800'
											: 'border-gray-200 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50'
									} ${hasError ? 'border-b-2 border-red-500' : ''}`}
									onClick={() => setActiveTabIndex(index)}
								>
									<span className={`text-sm font-medium ${hasError ? 'text-red-500' : ''}`}>
										{localeInfo?.label || field.locale}
									</span>
									{translationFields.length > 1 && (
										<button
											type="button"
											className="ml-1 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
											disabled={isPending}
											onClick={(e) => {
												e.stopPropagation();
												removeTranslation(index);
												if (activeTabIndex >= translationFields.length - 1 && activeTabIndex > 0) {
													setActiveTabIndex(activeTabIndex - 1);
												}
											}}
										>
											✕
										</button>
									)}
								</div>
							);
						})}
					</div>

					{translationFields.length > 0 && activeTabIndex < translationFields.length && (
						<div
							key={translationFields[activeTabIndex].id}
							className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700"
						>
							<div className="grid grid-cols-1 gap-4">
								<label className="space-y-1.5">
									<span className="text-sm font-semibold">{translate('admin.title')}</span>
									<input
										{...register(`translations.${activeTabIndex}.name`)}
										className={fieldClassName}
										disabled={isPending}
									/>
									{errors.translations?.[activeTabIndex]?.name && (
										<p className="text-xs text-red-500">
											{errors.translations[activeTabIndex]?.name?.message}
										</p>
									)}
								</label>
							</div>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 gap-4">
					<label className="space-y-1.5">
						<span className="text-sm font-semibold">{translate('admin.slug')}</span>
						<input
							{...register('slug')}
							className={fieldClassName}
							disabled={isPending}
							placeholder="category-slug"
						/>
						<p className="text-xs text-gray-500">{translate('admin.slugDescription')}</p>
						{errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
					</label>
				</div>
			</div>

			<div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
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
