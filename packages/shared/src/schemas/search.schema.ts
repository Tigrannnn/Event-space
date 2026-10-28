import { z } from './openapi';

export const SEARCH_QUERY_MAX_LENGTH = 100;
export const SEARCH_QUERY_MIN_LENGTH = 2;

export const RecordSearchQuerySchema = z.object({
	query: z.string().trim().min(SEARCH_QUERY_MIN_LENGTH).max(SEARCH_QUERY_MAX_LENGTH),
});
export type RecordSearchQueryData = z.infer<typeof RecordSearchQuerySchema>;

/** An event as the search dropdown needs it: enough for a row, nothing that needs a second request. */
export const SearchSuggestedEventSchema = z.object({
	id: z.string(),
	price: z.coerce.number(),
	imageUrl: z.string().nullable(),
	nextDate: z.coerce.date().nullable(),
	translations: z.array(z.object({ locale: z.string(), title: z.string(), location: z.string() })),
	categoryTranslations: z.array(z.object({ locale: z.string(), name: z.string() })),
});
export type SearchSuggestedEvent = z.infer<typeof SearchSuggestedEventSchema>;

export const SearchSuggestedCategorySchema = z.object({
	slug: z.string(),
	translations: z.array(z.object({ locale: z.string(), name: z.string() })),
});
export type SearchSuggestedCategory = z.infer<typeof SearchSuggestedCategorySchema>;

export const SearchSuggestionsSchema = z.object({
	events: z.array(SearchSuggestedEventSchema),
	categories: z.array(SearchSuggestedCategorySchema),
});
export type SearchSuggestions = z.infer<typeof SearchSuggestionsSchema>;

export const SearchHistoryItemSchema = z.object({ id: z.string(), query: z.string() });
export type SearchHistoryItem = z.infer<typeof SearchHistoryItemSchema>;
