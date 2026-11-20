import { z } from 'zod';

export const SourceKindSchema = z.enum(['PARTNER','PLATFORM']);

export type SourceKindType = `${z.infer<typeof SourceKindSchema>}`

export default SourceKindSchema;
