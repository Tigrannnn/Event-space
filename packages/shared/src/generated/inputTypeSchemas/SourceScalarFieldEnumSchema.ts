import { z } from 'zod';

export const SourceScalarFieldEnumSchema = z.enum(['id','code','name','nameKey','kind','isActive','createdAt','updatedAt']);

export default SourceScalarFieldEnumSchema;
