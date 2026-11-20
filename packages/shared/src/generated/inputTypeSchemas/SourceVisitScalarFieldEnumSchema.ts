import { z } from 'zod';

export const SourceVisitScalarFieldEnumSchema = z.enum(['id','sourceId','ref','createdAt']);

export default SourceVisitScalarFieldEnumSchema;
