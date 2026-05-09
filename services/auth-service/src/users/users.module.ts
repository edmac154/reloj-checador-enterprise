import { Module } from '@nestjs/common';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import {
  JwtModule,
} from '@nestjs/jwt';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { User } from './entities/user.entity';

import { UsersService } from './users.service';

import { UsersController } from './users.controller';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService:
          ConfigService,
      ) => ({
        secret:
          configService.get(
            'JWT_SECRET',
          ),
      }),
    }),
  ],

  controllers: [
    UsersController,
  ],

  providers: [
    UsersService,
    JwtAuthGuard,
  ],

  exports: [
    UsersService,
  ],
})
export class UsersModule {}