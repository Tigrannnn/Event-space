import { z } from './openapi';
import { BannerSchema as GeneratedBannerSchema } from '../generated/modelSchema/BannerSchema';
import { BannerTranslationSchema as GeneratedBannerTranslationSchema } from '../generated/modelSchema/BannerTranslationSchema';
import { BannerStatusSchema } from '../generated/inputTypeSchemas/BannerStatusSchema';
import { BannerTargetTypeSchema } from '../generated/inputTypeSchemas/BannerTargetTypeSchema';
import { BannerTextAlignSchema } from '../generated/inputTypeSchemas/BannerTextAlignSchema';
import { BannerThemeSchema } from '../generated/inputTypeSchemas/BannerThemeSchema';
import { EventTranslationSchema } from './event-translation.schema';
import { CategoryTranslationSchema } from './category.schema';
import { BANNER_LIMITS } from '../constants/banner.constant';

export const BannerStatusEnum = BannerStatusSchema;
export type BannerStatus = z.infer<typeof BannerStatusEnum>;

export const BannerTargetTypeEnum = BannerTargetTypeSchema;
export type BannerTargetType = z.infer<typeof BannerTargetTypeEnum>;

export const BannerTextAlignEnum = BannerTextAlignSchema;
export type BannerTextAlign = z.infer<typeof BannerTextAlignEnum>;

export const BannerThemeEnum = BannerThemeSchema;
export type BannerTheme = z.infer<typeof BannerThemeEnum>;

export const BannerTranslationSchema = GeneratedBannerTranslationSchema;
export type BannerTranslation = z.infer<typeof BannerTranslationSchema>;

/** Target as the client needs it: enough to build a link and name the slide in the admin list. */
export const BannerEventTargetSchema = z.object({
	id: z.string(),
	status: z.string(),
	translations: z.array(EventTranslationSchema).default([]),
});

export const BannerCategoryTargetSchema = z.object({
	id: z.string(),
	slug: z.string(),
	translations: z.array(CategoryTranslationSchema).default([]),
});

export const BannerSchema = GeneratedBannerSchema.extend({
	translations: z.array(BannerTranslationSchema).default([]),
	event: BannerEventTargetSchema.nullish(),
	category: BannerCategoryTargetSchema.nullish(),
});

export type Banner = z.infer<typeof BannerSchema>;

export const CreateBannerTranslationSchema = z.object({
	locale: BannerTranslationSchema.shape.locale,
	title: z.string().trim().max(BANNER_LIMITS.TITLE_MAX).nullish(),
	subtitle: z.string().trim().max(BANNER_LIMITS.SUBTITLE_MAX).nullish(),
});

export type CreateBannerTranslation = z.infer<typeof CreateBannerTranslationSchema>;

const BannerFieldsSchema = z.object({
	status: BannerStatusEnum,
	startsAt: z.coerce.date().nullish(),
	endsAt: z.coerce.date().nullish(),
	targetType: BannerTargetTypeEnum,
	eventId: z.uuid().nullish(),
	categoryId: z.uuid().nullish(),
	url: z.url().max(BANNER_LIMITS.URL_MAX).nullish(),
	textAlign: BannerTextAlignEnum,
	theme: BannerThemeEnum,
	translations: z.array(CreateBannerTranslationSchema),
});

/** A slide points at exactly one thing, and the other two fields must stay empty. */
export function bannerTargetIssue(target: {
	targetType: BannerTargetType;
	eventId?: string | null;
	categoryId?: string | null;
	url?: string | null;
}): 'eventId' | 'categoryId' | 'url' | null {
	switch (target.targetType) {
		case 'EVENT':
			return target.eventId ? null : 'eventId';
		case 'CATEGORY':
			return target.categoryId ? null : 'categoryId';
		case 'URL':
			return target.url ? null : 'url';
	}
}

function refineBanner(
	value: {
		targetType?: BannerTargetType;
		eventId?: string | null;
		categoryId?: string | null;
		url?: string | null;
		startsAt?: Date | null;
		endsAt?: Date | null;
		translations?: CreateBannerTranslation[];
	},
	ctx: z.RefinementCtx,
): void {
	if (value.targetType) {
		const missing = bannerTargetIssue({ ...value, targetType: value.targetType });
		if (missing) {
			ctx.addIssue({
				code: 'custom',
				path: [missing],
				message: 'Target is required for this banner type',
			});
		}
	}

	if (value.startsAt && value.endsAt && value.startsAt.getTime() > value.endsAt.getTime()) {
		ctx.addIssue({
			code: 'custom',
			path: ['endsAt'],
			message: 'End date must not precede the start date',
		});
	}

	if (value.translations) {
		const locales = value.translations.map((translation) => translation.locale);
		if (new Set(locales).size !== locales.length) {
			ctx.addIssue({
				code: 'custom',
				path: ['translations'],
				message: 'Duplicate locale',
			});
		}
	}
}

// The defaults live on the create schema alone. On a partial update zod still fills a missing
// key with its default, which would quietly send an edited banner back to DRAFT, left-aligned.
export const CreateBannerSchema = BannerFieldsSchema.extend({
	status: BannerStatusEnum.default('DRAFT'),
	textAlign: BannerTextAlignEnum.default('LEFT'),
	theme: BannerThemeEnum.default('DARK'),
	translations: z.array(CreateBannerTranslationSchema).default([]),
})
	.superRefine(refineBanner)
	.openapi({ description: 'JSON payload field for POST /banners (multipart)' });

export type CreateBannerData = z.infer<typeof CreateBannerSchema>;

export const UpdateBannerSchema = BannerFieldsSchema.partial()
	.superRefine(refineBanner)
	.openapi({ description: 'JSON payload field for PUT /banners/:id (multipart)' });

export type UpdateBannerData = z.infer<typeof UpdateBannerSchema>;

export const ReorderBannersSchema = z.object({
	ids: z.array(z.uuid()).min(1),
});

export type ReorderBannersData = z.infer<typeof ReorderBannersSchema>;
