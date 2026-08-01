import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppErrorCode } from '@event-space/shared';
import { AppException } from '../exceptions/app.exception';

export const GetCurrentUserId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) throw new AppException(AppErrorCode.UNAUTHORIZED);
    return user?.sub;
  },
);