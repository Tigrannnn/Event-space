import {
	BANNER_LIMITS,
	BannerStatusEnum,
	BannerTargetTypeEnum,
	BannerTextAlignEnum,
	BannerThemeEnum,
	LocaleEnum,
} from '@event-space/shared';
import z from 'zod';

export const BannerFormImageSchema = z.union([
	z.object({ kind: z.literal('existing'), url: z.string() }),
	z.object({ kind: z.literal('file'), file: z.instanceof(File), previewUrl: z.string() }),
]);

export type BannerFormImage = z.infer<typeof BannerFormImageSchema>;

export const BannerFormTranslationSchema = z.object({
	locale: LocaleEnum,
	title: z.string().max(BANNER_LIMITS.TITLE_MAX),
	subtitle: z.string().max(BANNER_LIMITS.SUBTITLE_MAX).optional(),
});

export type BannerFormTranslationValues = z.infer<typeof BannerFormTranslationSchema>;

export const BannerFormSchema = z
	.object({
		status: BannerStatusEnum,
		startsAt: z.string().optional(),
		endsAt: z.string().optional(),
		targetType: BannerTargetTypeEnum,
		eventId: z.string().optional(),
		categoryId: z.string().optional(),
		url: z.string().optional(),
		textAlign: BannerTextAlignEnum,
		theme: BannerThemeEnum,
		image: BannerFormImageSchema.nullable(),
		translations: z.array(BannerFormTranslationSchema),
	})
	.superRefine((values, ctx) => {
		if (!values.image) {
			ctx.addIssue({ code: 'custom', path: ['image'], message: 'admin.validation.imageRequired' });
		}

		if (values.targetType === 'EVENT' && !values.eventId) {
			ctx.addIssue({
				code: 'custom',
				path: ['eventId'],
				message: 'admin.validation.targetRequired',
			});
		}

		if (values.targetType === 'CATEGORY' && !values.categoryId) {
			ctx.addIssue({
				code: 'custom',
				path: ['categoryId'],
				message: 'admin.validation.targetRequired',
			});
		}

		if (values.targetType === 'URL' && !values.url?.trim()) {
			ctx.addIssue({ code: 'custom', path: ['url'], message: 'admin.validation.targetRequired' });
		}

		if (values.startsAt && values.endsAt && values.startsAt > values.endsAt) {
			ctx.addIssue({
				code: 'custom',
				path: ['endsAt'],
				message: 'admin.validation.endBeforeStart',
			});
		}

		const locales = values.translations.map((translation) => translation.locale);
		if (new Set(locales).size !== locales.length) {
			ctx.addIssue({
				code: 'custom',
				path: ['translations'],
				message: 'admin.validation.duplicateLocale',
			});
		}
	});

export type BannerFormValues = z.infer<typeof BannerFormSchema>;
