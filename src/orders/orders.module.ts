import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartsModule } from 'src/carts/carts.module';
import { MenusModule } from 'src/menus/menus.module';

@Module({
  imports: [CartsModule, MenusModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
