import { Body, Controller, Post, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JWTGuard } from 'src/auth/auth.guard';
import { Request as RequestExpress } from 'express';
import { OrderReqDto } from './dto/orders.dto';
import { CartsService } from 'src/carts/carts.service';
import { MenusService } from 'src/menus/menus.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly cartsService: CartsService,
    private readonly menuService: MenusService,
  ) { }

  @UseGuards(JWTGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(
    @Request() req: RequestExpress,
    @Body() reqBody: OrderReqDto,
  ) {
    let cart = await this.cartsService.validateCart(reqBody.cartUuid, req["user"].sub)
    let cartItems = await this.cartsService.getCartItems(cart.id)

    let menusId = cartItems.map((item) => item.menu_id)

    let availableMenus = await this.menuService.getOutletAvailableMenus(cart.id, menusId)
    let availableMenusId = availableMenus.map((item) => item.menu_id)
    let filteredCartItems = cartItems.filter((item) => availableMenusId.includes(item.menu_id))

    let isSomeMenusNotAvailable = menusId.length != availableMenusId.length

    let menus = await this.menuService.getMenus(availableMenusId)
    // create order by move every item from cart
    //   don't forget to calculate the sub total and total
  }
}
