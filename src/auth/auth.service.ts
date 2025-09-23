import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { ForgotPasswordDto } from "src/data/dto/forgot-password.dto";
import { JwtPayload } from "src/data/dto/jwt-payload.dto";
import { RegisterDto } from "src/data/dto/register.dto";
import { ResetPasswordDto } from "src/data/dto/reset-password.dto";
import { BlacklistedToken } from "src/data/entity/blacklisted_token";
import { User } from "src/data/entity/user.entity";
import { Repository, LessThan, MoreThan } from "typeorm";
import { EmailService } from "../email/email.service";
import { connect } from "http2";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BlacklistedToken)
    private blacklistedTokenRepository: Repository<BlacklistedToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; access_token: string }> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = { sub: savedUser.id, email: savedUser.email };
    const access_token = this.jwtService.sign(payload);

    // Remove password from response using destructuring
    const { password: _, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword as User,
      access_token,
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }

  async login(user: User): Promise<{ user: User; access_token: string }> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException("Token is required");
    }

    try {
      // Decode token to get expiration
      const decoded = this.jwtService.decode(token);

      if (!decoded || !decoded.exp) {
        throw new BadRequestException("Invalid token format");
      }

      const expiresAt = new Date(decoded.exp * 1000);

      // Check if token is already blacklisted
      const existingBlacklistedToken =
        await this.blacklistedTokenRepository.findOne({
          where: { token },
        });

      if (existingBlacklistedToken) {
        return { message: "Token already invalidated" };
      }

      // Add token to blacklist
      const blacklistedToken = this.blacklistedTokenRepository.create({
        token,
        expiresAt,
      });

      await this.blacklistedTokenRepository.save(blacklistedToken);

      // Clean up expired tokens (optional, can be done via cron job)
      await this.cleanupExpiredTokens();

      return { message: "Successfully logged out" };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException("Invalid token");
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("Reset token: " + resetToken);
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    const updatedUser = await this.userRepository.save(user);
    console.log(updatedUser);

    // Send email with reset link
    const resetUrl = `${this.configService.get("FRONTEND_URL", "http://localhost:3000")}/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // Log error but don't expose email service issues to user
      console.error("Failed to send password reset email:", error);
    }

    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(oneHourAgo),
        isActive: true,
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await this.userRepository.save(user);

    return { message: "Password has been successfully reset" };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
    });
  }

  private async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.blacklistedTokenRepository
      .createQueryBuilder()
      .delete()
      .from(BlacklistedToken)
      .where("expiresAt < :now", { now })
      .execute();
  }
}
