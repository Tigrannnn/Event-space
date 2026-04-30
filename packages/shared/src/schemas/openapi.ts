import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI metadata methods like .openapi()
extendZodWithOpenApi(z);

export { z };