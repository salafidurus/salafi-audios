import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { LiveConfigService } from "../config/config.service";

@Injectable()
export class InternalGuard implements CanActivate {
  constructor(private readonly config: LiveConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.headers["x-internal-secret"];
    if (provided !== this.config.internalSecret) {
      throw new UnauthorizedException("Invalid or missing internal secret");
    }
    return true;
  }
}
