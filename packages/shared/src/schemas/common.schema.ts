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

export const TimeFilterSchema = z.enum(['upcoming', 'completed']);
export type TimeFilterType = z.infer<typeof TimeFilterSchema>;
