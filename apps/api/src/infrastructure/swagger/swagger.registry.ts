import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import * as allExports from '@event-space/shared/schemas';
import z from 'zod';

/**
 * Global registry for Zod schemas to be converted into OpenAPI components.
 */
export const registry = new OpenAPIRegistry();

const IGNORED_SCHEMA_NAMES = new Set([
	'EnvSchema',
	'ImageUploaderFileItemSchema',
	'ImageUploaderExistingItemSchema',
	'ImageUploaderItemSchema',
]);

const isZodType = (value: unknown): value is z.ZodType => {
	return (
		value !== null &&
		typeof value === 'object' &&
		'_def' in value &&
		typeof (value as any)._def === 'object'
	);
};

/**
 * Automatically discovers and registers Zod schemas from the shared schemas package.
 */
export function generateOpenApiComponents() {
	const registeredNames = new Set<string>();

	const registerRecursive = (obj: any) => {
		if (!obj || typeof obj !== 'object') return;

		Object.entries(obj).forEach(([name, item]) => {
			if (IGNORED_SCHEMA_NAMES.has(name)) {
				console.debug(`[Swagger] Skipping unsupported schema: ${name}`);
				return;
			}

			if (isZodType(item)) {
				if (!registeredNames.has(name)) {
					try {
						registry.register(name, item as any);
						registeredNames.add(name);
					} catch (error) {
						console.warn(`[Swagger] Failed to register ${name}:`, (error as Error).message);
					}
				}
			} else if (item && typeof item === 'object' && !Array.isArray(item)) {
				registerRecursive(item);
			}
		});
	};

	registerRecursive(allExports);
	console.log('[Swagger] Registered schemas:', Array.from(registeredNames).join(', '));

	try {
		console.log('[Swagger] Generating components...');
		const generator = new OpenApiGeneratorV3(registry.definitions);
		const result = generator.generateComponents();
		console.log(
			`[Swagger] Successfully generated ${Object.keys(result.components?.schemas || {}).length} components`,
		);
		return result.components?.schemas;
	} catch (error) {
		console.error('[Swagger] Failed to generate components:', (error as Error).message);
		console.error('[Swagger] Error details:', error);
		return undefined;
	}
}
