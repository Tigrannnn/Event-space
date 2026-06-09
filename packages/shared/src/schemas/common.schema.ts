import { z } from 'zod';

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		data: z.array(dataSchema),
		total: z.number(),
		skip: z.number(),
		take: z.number(),
		hasMore: z.boolean(),
		nextSkip: z.number().nullable(),
	});

export type PaginatedResponse<T> = {
	data: T[];
	total: number;
	skip: number;
	take: number;
	hasMore: boolean;
	nextSkip: number | null;
};

export const PaginatedParamsSchema = z.object({
	skip: z.number().optional(),
	limit: z.number().optional(),
});

export type PaginatedParams = z.infer<typeof PaginatedParamsSchema>;

export const PaginatedCursorResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		data: z.array(dataSchema),
		nextCursor: z.string().nullable(),
		hasMore: z.boolean(),
	});

export type PaginatedCursorResponse<T> = {
	data: T[];
	nextCursor: string | null;
	hasMore: boolean;
};

export const PaginatedCursorParamsSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().optional(),
});

export type PaginatedCursorParams = z.infer<typeof PaginatedCursorParamsSchema>;

export const TimeFilterSchema = z.enum(['upcoming', 'completed']);
export type TimeFilterType = z.infer<typeof TimeFilterSchema>;
