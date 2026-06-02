import { z } from 'zod';

export const OutboxEventScalarFieldEnumSchema = z.enum(['id','action','payload','status','attempts','lastError','createdAt','processedAt']);

export default OutboxEventScalarFieldEnumSchema;
