import { createParamDecorator, SetMetadata } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Core API decorators module providing shared backend infrastructure and authority-boundary services. */
/** Runtime API declaration for is public key. */
export const IS_PUBLIC_KEY = 'isPublic';

/** Runtime API declaration for public. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Runtime API declaration for current user. */
export const CurrentUser = createParamDecorator((_data: undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request.user;
});
