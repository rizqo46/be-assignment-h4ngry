import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MenusModule } from 'src/menus/menus.module';
import { OutletsModule } from 'src/outlets/outlets.module';

@Module({
  imports: [AuthModule, MenusModule, OutletsModule],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
