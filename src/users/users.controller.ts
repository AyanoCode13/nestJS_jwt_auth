import {
  Controller,
  UseGuards,
  Get,
  Headers,
  Param,
  Delete,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UsersService } from "./users.service";
import { LocalAuthGuard } from "src/auth/local-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Get(":id")
  getUserById(@Param("id") id: string) {
    return this.usersService.findById(+id);
  }

  @UseGuards(LocalAuthGuard)
  @Delete(":id")
  deleteUser(@Request() req) {
    return this.usersService.delete(req.params.id);
  }
}
