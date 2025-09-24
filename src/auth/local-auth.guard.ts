import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { User } from "src/data/entity/user.entity";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log(context.getArgs());
    return false;
  }
}
