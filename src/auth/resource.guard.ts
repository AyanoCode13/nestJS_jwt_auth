import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { User } from "src/data/entity/user.entity";

@Injectable()
export class ResourceGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as User; // Populated by JwtAuthGuard
    const resourceId = +request.params.id; // User ID from URL params

    // Allow if user is trying to access their own resource
    if (user.id !== resourceId) {
      throw new ForbiddenException("You can only manage your own account");
    }
    return true;
  }
}
