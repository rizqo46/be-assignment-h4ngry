import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/shared/models/users.model';
import { LoginRespDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) { }
    async signIn(user: Partial<UserModel>): Promise<LoginRespDto> {
        const payload = { sub: user.id, username: user.username }
        return new LoginRespDto(await this.jwtService.signAsync(payload))
    }
}
