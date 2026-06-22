import { z } from 'zod';

export const LocaleSchema = z.enum(['en','ru','hy']);

export type LocaleType = `${z.infer<typeof LocaleSchema>}`

export default LocaleSchema;
