import {
  Controller,
  UseGuards,
  Get,
  Headers,
  Param,
  Delete,
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

  @Delete(":id")
  deleteUser(
    @Param("id") id: string,
    @Headers("authorization") authorization: string,
  ) {
    const token = authorization.replace("Bearer ", "");
    console.log(token);
    return this.usersService.delete(id, token);
  }
}
