import { z } from 'zod';

export const EventDifficultySchema = z.enum(['NONE','EASY','MODERATE','HARD']);

export type EventDifficultyType = `${z.infer<typeof EventDifficultySchema>}`

export default EventDifficultySchema;
