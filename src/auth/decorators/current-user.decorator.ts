import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { RequestUser } from 'src/utils/types/auth/auth';

type AuthenticatedRequest = Request & { user: RequestUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RequestUser => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
