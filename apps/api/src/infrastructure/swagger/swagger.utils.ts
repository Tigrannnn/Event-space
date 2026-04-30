import * as allSchemas from '@event-space/shared';

/**
 * Returns a typed Swagger reference object for a given schema name.
 * @param schemaName - Must be a valid export name from the shared package.
 */
export const getReference = (schemaName: keyof typeof allSchemas) => ({
  schema: {
    $ref: `#/components/schemas/${schemaName}`,
  },
});