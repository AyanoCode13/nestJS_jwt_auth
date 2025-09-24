import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { Observable } from "rxjs";
import { JwtPayload } from "src/data/dto/jwt-payload.dto";
import { User } from "src/data/entity/user.entity";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  constructor(private jwtService: JwtService) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log("Local Guard");
    const request: Request = super.getRequest(context);
    console.log(request.params["id"]);
    const userId = request.params["id"];
    const auth = request.headers.authorization;
    if (!auth) {
      return true;
    }
    const token = auth.replace("Bearer ", "");
    const { sub } = this.jwtService.decode<JwtPayload>(token);
    return sub.toString() == userId;
  }
}
