import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import * as allExports from '@event-space/shared';
import z from 'zod';

/**
 * Global registry for Zod schemas to be converted into OpenAPI components.
 */
export const registry = new OpenAPIRegistry();

/**
 * Automatically discovers and registers Zod schemas from the shared library.
 * It recursively traverses exports to handle nested barrel exports (index.ts files).
 */
export function generateOpenApiComponents() {
	const registeredNames = new Set<string>();

	const registerRecursive = (obj: any) => {
		if (!obj || typeof obj !== 'object') return;

		Object.entries(obj).forEach(([name, item]) => {
			const isZod =
				item &&
				typeof item === 'object' &&
				('_def' in item || 'parse' in item || item instanceof z.ZodType);

			if (isZod) {
				if (!registeredNames.has(name)) {
					try {
						registry.register(name, item as any);
						registeredNames.add(name);
					} catch (error) {
						console.warn(`[Swagger] Failed to register ${name}:`, error.message);
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
		console.error('[Swagger] Failed to generate components:', error.message);
		console.error('[Swagger] Error details:', error);
		return undefined;
	}
}
