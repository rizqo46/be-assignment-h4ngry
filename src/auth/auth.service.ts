import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/shared/models/users.model';
import { LoginRespDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly usersService: UsersService,

  ) { }
  async signIn(username: string) {
    const user = await this.usersService.findOne(username);
    if (!user) {
      throw new BadRequestException('user not found');
    }

    const payload = { sub: user.id, username: user.username };
    return new LoginRespDto(await this.jwtService.signAsync(payload));
  }
}
