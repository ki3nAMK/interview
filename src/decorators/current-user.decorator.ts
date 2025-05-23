import { AppRequest } from '@/dtos/requests/app.request';
import { ExecutionContext } from '@nestjs/common';

import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.currentUserId;
  },
);
