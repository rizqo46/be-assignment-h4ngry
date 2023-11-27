import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

const authControllerName = 'auth';

@ApiTags(authControllerName)
@Controller(authControllerName)
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: LoginDto) {
    const user = await this.usersService.findOne(req.username);

    if (!user) {
      throw new BadRequestException('user not found');
    }

    return this.authService.signIn(user);
  }
}
