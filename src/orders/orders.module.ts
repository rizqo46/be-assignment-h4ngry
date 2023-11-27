import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartsModule } from 'src/carts/carts.module';
import { MenusModule } from 'src/menus/menus.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [CartsModule, MenusModule, SharedModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
