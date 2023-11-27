import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto, LoginRespDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

const authControllerName = 'auth';

@ApiTags(authControllerName)
@Controller(authControllerName)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBadRequestResponse({description: "Username not registered"})
  @HttpCode(HttpStatus.OK)
  async login(@Body() req: LoginDto) {
    return this.authService.signIn(req.username);
  }
}
