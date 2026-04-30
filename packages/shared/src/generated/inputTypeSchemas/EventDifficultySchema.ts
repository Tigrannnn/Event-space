import { z } from 'zod';

export const EventDifficultySchema = z.enum(['EASY','MODERATE','HARD']);

export type EventDifficultyType = `${z.infer<typeof EventDifficultySchema>}`

export default EventDifficultySchema;
