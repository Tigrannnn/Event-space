import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetBrandHost = createParamDecorator(
	(_: undefined, context: ExecutionContext): string | undefined => {
		const request = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
		const header = request.headers?.['x-brand-host'];

		return typeof header === 'string' && header.trim() ? header.trim() : undefined;
	},
);
