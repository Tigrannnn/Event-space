import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAccessTokenGuard extends AuthGuard('jwt') {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			await (super.canActivate(context) as Promise<boolean>);
		} catch {
            // If the user is not authenticated, we catch the error and allow the request to proceed without a user.
		}
		return true;
	}

	handleRequest(err: any, user: any) {
		return user || undefined;
	}
}