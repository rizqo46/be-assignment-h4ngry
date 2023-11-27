import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './constants/jwt.constants';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '600d' },
    }),
    SharedModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
