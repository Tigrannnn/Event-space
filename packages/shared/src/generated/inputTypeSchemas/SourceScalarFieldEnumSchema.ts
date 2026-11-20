import { z } from 'zod';

export const SourceScalarFieldEnumSchema = z.enum(['id','code','name','nameKey','isActive','createdAt','updatedAt']);

export default SourceScalarFieldEnumSchema;
