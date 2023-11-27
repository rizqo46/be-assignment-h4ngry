import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginRespDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async signIn(username: string) {
    const user = await this.usersService.findOne(username);

    const payload = { sub: user.id, username: user.username };
    return new LoginRespDto(await this.jwtService.signAsync(payload));
  }
}
