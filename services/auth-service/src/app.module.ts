import { Module } from '@nestjs/common';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import {
  TypeOrmModule,
} from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';

import { UsersModule } from './users/users.module';

import { User } from './users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        configService:
          ConfigService,
      ) => ({
        type: 'postgres',

        url: configService.get(
          'DATABASE_URL',
        ),

        ssl: {
          rejectUnauthorized: false,
        },

        entities: [User],

        synchronize: true,
      }),
    }),

    AuthModule,

    UsersModule,
  ],
})
export class AppModule {}