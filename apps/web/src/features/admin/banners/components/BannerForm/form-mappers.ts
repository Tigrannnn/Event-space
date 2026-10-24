import { toZonedLocalInput, zonedLocalInputToDate } from '@event-space/shared';
import type { Banner } from '@event-space/shared';
import type { BannerFormValues } from './banner-form.schema';

export function mapBannerToFormValues(banner?: Banner): BannerFormValues {
	return {
		status: banner?.status ?? 'DRAFT',
		startsAt: banner?.startsAt ? toZonedLocalInput(banner.startsAt) : '',
		endsAt: banner?.endsAt ? toZonedLocalInput(banner.endsAt) : '',
		targetType: banner?.targetType ?? 'EVENT',
		eventId: banner?.eventId ?? '',
		categoryId: banner?.categoryId ?? '',
		url: banner?.url ?? '',
		textAlign: banner?.textAlign ?? 'LEFT',
		theme: banner?.theme ?? 'DARK',
		image: banner ? { kind: 'existing', url: banner.imageUrl } : null,
		imageMobile: banner?.imageMobileUrl ? { kind: 'existing', url: banner.imageMobileUrl } : null,
		translations: (banner?.translations ?? []).map((translation) => ({
			locale: translation.locale,
			title: translation.title,
			subtitle: translation.subtitle ?? '',
			ctaLabel: translation.ctaLabel ?? '',
		})),
	};
}

function toIsoOrNull(value: string | undefined): string | null {
	if (!value) return null;

	return (zonedLocalInputToDate(value) ?? new Date(value)).toISOString();
}

function buildPayload(values: BannerFormValues) {
	return {
		status: values.status,
		startsAt: toIsoOrNull(values.startsAt),
		endsAt: toIsoOrNull(values.endsAt),
		targetType: values.targetType,
		eventId: values.targetType === 'EVENT' ? values.eventId : null,
		categoryId: values.targetType === 'CATEGORY' ? values.categoryId : null,
		url: values.targetType === 'URL' ? values.url?.trim() : null,
		textAlign: values.textAlign,
		theme: values.theme,
		translations: values.translations.map((translation) => ({
			locale: translation.locale,
			title: translation.title.trim(),
			subtitle: translation.subtitle?.trim() || null,
			ctaLabel: translation.ctaLabel?.trim() || null,
		})),
	};
}

function appendFiles(formData: FormData, values: BannerFormValues): void {
	if (values.image?.kind === 'file') {
		formData.append('image', values.image.file);
	}

	if (values.imageMobile?.kind === 'file') {
		formData.append('imageMobile', values.imageMobile.file);
	}
}

export function buildCreateBannerFormData(values: BannerFormValues): FormData {
	const formData = new FormData();
	formData.append('payload', JSON.stringify(buildPayload(values)));
	appendFiles(formData, values);

	return formData;
}

export function buildUpdateBannerFormData(values: BannerFormValues, banner: Banner): FormData {
	const formData = new FormData();
	formData.append(
		'payload',
		JSON.stringify({
			...buildPayload(values),
			removeMobileImage: Boolean(banner.imageMobileUrl) && values.imageMobile === null,
		}),
	);
	appendFiles(formData, values);

	return formData;
}
