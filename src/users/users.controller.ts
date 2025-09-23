import { Controller, UseGuards, Get, Request, Param } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  getCurrentUser(@Request() req) {
    return {
      user: req.user,
      message: "Current user information",
    };
  }

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(":id")
  getUserById(@Param("id") id: string) {
    return this.usersService.findById(+id);
  }
}
