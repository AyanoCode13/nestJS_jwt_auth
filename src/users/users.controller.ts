import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Redirect,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UsersService } from "./users.service";
import { ResourceGuard } from "src/auth/resource.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  //Curent User Routes

  @Get("me")
  getCurrent(@Request() req) {
    return req.user;
  }

  @Patch("me")
  editCurrent(@Request() req) {
    //Edit Profile
    return req.user;
  }

  @Delete("me")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCurrent(@Request() req) {
    return this.usersService.delete(req.user.id);
  }

  // Public User Routes
  // Users can view each other's profile

  @Get(":id")
  getUser(@Param("id") id: string) {
    return this.usersService.findById(+id);
  }
}
