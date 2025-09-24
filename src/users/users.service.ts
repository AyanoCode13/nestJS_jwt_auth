import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "src/data/dto/jwt-payload.dto";
import { User } from "src/data/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: true },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  async delete(id: string, authorisation: string): Promise<void> {
    const { email } = this.jwtService.decode<JwtPayload>(authorisation);
    const crtUser = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (crtUser?.id.toString() != id) {
      throw new UnauthorizedException("User is unauthorised");
    }
    this.userRepository.delete(id);
  }
}
