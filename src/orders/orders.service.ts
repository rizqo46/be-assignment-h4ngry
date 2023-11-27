import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { CartsService } from 'src/carts/carts.service';
import { DB } from 'src/shared/models/d.db';
import { OrderItemModel } from 'src/shared/models/orders.model';
import { OrderReqDto } from './dto/orders.dto';
import { CartItemModel } from 'src/shared/models/carts.model';
import { MenuModel } from 'src/shared/models/menus.model';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { CartsRepo } from 'src/shared/repository/carts.repo';
import { MenusRepo } from 'src/shared/repository/menus.repo';
import { OrdersRepo } from 'src/shared/repository/orders.repo';

@Injectable()
export class OrdersService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly cartsService: CartsService,
    private readonly cartsRepo: CartsRepo,
    private readonly menusRepo: MenusRepo,
    private readonly ordersRepo: OrdersRepo,
  ) {}

  async makeOrder(
    userId: number,
    reqBody: OrderReqDto,
  ): Promise<SuccessRespDto> {
    // Validate the user's cart
    const cart = await this.cartsService.getAndValidateCart(
      reqBody.cartUuid,
      userId,
    );

    // Retrieve the cart items
    const cartItems = await this.cartsRepo.getCartItems(this.db, cart.id);

    // Get the IDs of the menu items in the cart
    const menuIds = cartItems.map((item) => item.menu_id);

    // Check the availability of the menu items
    const availableMenus = await this.menusRepo.getOutletAvailableMenus(
      this.db,
      cart.id,
      menuIds,
    );
    const availableMenuIds = availableMenus.map((item) => item.menu_id);

    // Filter the cart items to include only the ones with available menus
    const filteredCartItems = cartItems.filter((item) =>
      availableMenuIds.includes(item.menu_id),
    );

    // Check if some menus are not available
    const isSomeMenusNotAvailable = menuIds.length !== availableMenuIds.length;

    // Retrieve the details of the available menus
    const menus = await this.menusRepo.getMenus(this.db, availableMenuIds);

    // Create the order items model
    const orderItems = this.createOrderItemsModel(filteredCartItems, menus);

    // Calculate the total price
    const total = orderItems.reduce((acc, item) => acc + item.sub_total, 0);

    // Start a database transaction
    await this.db.transaction().execute(async (trx) => {
      // Lock the cart and its items
      await this.cartsRepo.lockCart(trx, cart.id);
      await this.cartsRepo.lockCartItems(trx, cart.id);

      // Create the order in the database
      const order = await this.ordersRepo.createOrder(trx, {
        outlet_id: cart.outlet_id,
        user_id: userId,
        total: total,
      });

      // Create the order items in the database
      await this.ordersRepo.createOrderItems(trx, order.id, orderItems);

      // Delete the cart items
      await this.cartsRepo.deleteCartItems(trx, cart.id);

      // Delete the cart
      await this.cartsRepo.deleteCart(trx, cart.id);
    });

    if (isSomeMenusNotAvailable) {
      return new SuccessRespDto("success, with some item can't be proccessed");
    }

    return new SuccessRespDto();
  }

  private createOrderItemsModel(
    cartItems: Partial<CartItemModel>[],
    menus: Partial<MenuModel>[],
  ) {
    const menuPriceMap = new Map(menus.map((menu) => [menu.id, menu.price]));

    const orderItems: Partial<OrderItemModel>[] = [];
    cartItems.forEach((item) => {
      orderItems.push({
        menu_id: item.menu_id,
        quantity: item.quantity,
        sub_total: item.quantity * menuPriceMap.get(item.menu_id),
      });
    });

    return orderItems;
  }
}
