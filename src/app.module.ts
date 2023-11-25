import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { OutletsModule } from './outlets/outlets.module';
import { MenusModule } from './menus/menus.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [ConfigModule.forRoot(), SharedModule, OutletsModule, MenusModule, AuthModule, UsersModule, CartsModule],
})
export class AppModule {}
