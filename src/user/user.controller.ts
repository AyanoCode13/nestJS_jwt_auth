import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UsersService } from "./user.service";

@Controller("user")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  //Curent User Routes

  @Get()
  get(@Request() req) {
    return req.user;
  }

  @Patch()
  edit(@Request() req) {
    //Edit Profile
    return req.user;
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Request() req) {
    return this.usersService.delete(req.user.id);
  }

  // Public User Routes
  // Users can view each other's profile

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.usersService.findById(+id);
  }
}
