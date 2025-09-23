import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/data/entity/user.entity";
import { JwtStrategy } from "src/strategy/auth/jwt.strategy";
import { LocalStrategy } from "src/strategy/auth/local.strategy";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BlacklistedToken } from "src/data/entity/blacklisted_token";
import { EmailModule } from "src/email/email.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BlacklistedToken]),
    PassportModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>("JWT_SECRET");
        if (!jwtSecret) {
          throw new Error("JWT_SECRET environment variable is required");
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>("JWT_EXPIRES_IN", "1d"),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
