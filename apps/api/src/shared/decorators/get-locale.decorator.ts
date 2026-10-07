import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { LocaleEnum } from '@event-space/shared';
import type { Locale } from '@prisma/client';

export const DEFAULT_MAIL_LOCALE: Locale = 'ru';

export const GetLocale = createParamDecorator((_: undefined, context: ExecutionContext): Locale => {
	const request = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
	const header = request.headers?.['x-locale'];
	const parsed = LocaleEnum.safeParse(typeof header === 'string' ? header : undefined);

	return parsed.success ? parsed.data : DEFAULT_MAIL_LOCALE;
});
