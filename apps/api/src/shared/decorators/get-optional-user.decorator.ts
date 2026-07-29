// get-optional-user-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetOptionalUserId = createParamDecorator(
	(_: undefined, context: ExecutionContext): string | undefined => {
		const request = context.switchToHttp().getRequest();
		const user = request.user;

		return user?.sub;
	},
);