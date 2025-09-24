import { ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { Observable } from "rxjs";
import { User } from "src/data/entity/user.entity";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log("Local Guard");
    const request: Request = super.getRequest(context);
    const user = request.user as User;
    return user && user.id.toString() == request.params.id;
  }
}
