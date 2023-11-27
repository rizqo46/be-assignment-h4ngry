import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthRespDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import { UsersRepo } from 'src/shared/repository/users.repo';
import { InjectKysely } from 'nestjs-kysely';
import { Kysely } from 'kysely';
import { DB } from 'src/shared/models/d.db';

@Injectable()
export class AuthService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly usersRepo: UsersRepo,
  ) {}
  async signIn(username: string) {
    const user = await this.usersService.findOne(username);

    const payload = { sub: user.id, username: user.username };
    return new AuthRespDto(await this.jwtService.signAsync(payload));
  }

  async register(username: string) {
    let user = await this.usersRepo.findOne(this.db, username);
    if (user) {
      throw new BadRequestException('username already registered');
    }

    user = await this.usersRepo.cretae(this.db, username);
    const payload = { sub: user.id, username: user.username };
    return new AuthRespDto(await this.jwtService.signAsync(payload));
  }
}
