import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthReqDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiTags } from '@nestjs/swagger';

const authControllerName = 'auth';

@ApiTags(authControllerName)
@Controller(authControllerName)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBadRequestResponse({ description: 'Username not registered' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: AuthReqDto) {
    return this.authService.signIn(req.username);
  }

  @Post('register')
  @ApiBadRequestResponse({ description: 'Username already registered' })
  @HttpCode(HttpStatus.OK)
  async register(@Body() req: AuthReqDto) {
    return this.authService.register(req.username);
  }
}
