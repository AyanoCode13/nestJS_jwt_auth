import {
  Body,
  Controller,
  Get,
  Request,
  HttpCode,
  HttpStatus,
  Post,
  Headers,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "src/data/dto/register.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { LocalAuthGuard } from "./local-auth.guard";
import { ForgotPasswordDto } from "src/data/dto/forgot-password.dto";
import { ResetPasswordDto } from "src/data/dto/reset-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return {
      user: req.user,
      message: "This is a protected route",
    };
  }
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Headers("authorization") authorization: string) {
    if (!authorization) {
      throw new BadRequestException("Authorization header is required");
    }

    const token = authorization.replace("Bearer ", "");

    if (!token || token === authorization) {
      throw new BadRequestException("Bearer token is required");
    }

    return this.authService.logout(token);
  }
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}

// token=34fbda69710c5879280e973a4a7e1544b20e0bce5a0e48e198e49e499286ef03
// http://localhost:3000/reset-password?token=d12b02945cdeca0a783c505cbf06aa15d577e61cf2ace944c663ff62404fdcb5