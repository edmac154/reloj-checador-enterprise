import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService:
      UsersService,

    private readonly jwtService:
      JwtService,
  ) {}

  async register(
    dto: any,
  ) {
    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      await this.usersService.create({
        ...dto,

        password:
          hashedPassword,
      });

    return {
      id: user.id,

      email: user.email,
    };
  }

  async login(
    dto: any,
  ) {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const valid =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!valid) {
      throw new UnauthorizedException(
        'Invalid credentials',
      );
    }

    const token =
      this.jwtService.sign({
        sub: user.id,

        email:
          user.email,

        role:
          user.role,
      });

    return {
      access_token:
        token,
    };
  }
}