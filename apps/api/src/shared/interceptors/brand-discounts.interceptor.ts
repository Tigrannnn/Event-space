import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { dateDiscountsEnabled, stripDateDiscounts } from '../utils/brand-discounts.util';

@Injectable()
export class BrandDiscountsInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const request = context.switchToHttp().getRequest<{ headers?: Record<string, unknown> }>();
		const header = request.headers?.['x-brand-host'];
		const brandHost = typeof header === 'string' && header.trim() ? header.trim() : undefined;

		if (dateDiscountsEnabled(brandHost)) return next.handle();

		return next.handle().pipe(
			map((body: unknown) => {
				stripDateDiscounts(body);
				return body;
			}),
		);
	}
}
