import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { BlacklistedToken } from "./data/entity/blacklisted_token";
import { User } from "./data/entity/user.entity";
import { EmailModule } from "./email/email.module";
import { JwtStrategy } from "./strategy/auth/jwt.strategy";
import { LocalStrategy } from "./strategy/auth/local.strategy";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "sqlite",
        database: configService.get("DB_PATH", "database.sqlite"),
        entities: [User, BlacklistedToken],
        synchronize: configService.get("NODE_ENV") !== "production",
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EmailModule,
  ],
})
export class AppModule {}
