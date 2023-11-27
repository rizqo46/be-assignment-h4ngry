import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MenusModule } from 'src/menus/menus.module';
import { OutletsModule } from 'src/outlets/outlets.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [AuthModule, MenusModule, OutletsModule, SharedModule],
  controllers: [CartsController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
