import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')

@Controller('users')
export class UsersController {
  @Get('me')

  @ApiBearerAuth()

  @UseGuards(JwtAuthGuard)

  me(
    @Req() request: any,
  ) {
    return {
      user:
        request.user,
    };
  }
}