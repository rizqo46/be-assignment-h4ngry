import { Injectable } from '@nestjs/common';
import { Kysely, Transaction } from 'kysely';
import { InsertObjectOrList } from 'kysely/dist/cjs/parser/insert-values-parser';
import { InjectKysely } from 'nestjs-kysely';
import { CartsService } from 'src/carts/carts.service';
import { MenusService } from 'src/menus/menus.service';
import { DB } from 'src/shared/models/d.db';
import { OrderItemModel, OrderModel } from 'src/shared/models/orders.model';
import { OrderReqDto } from './dto/orders.dto';
import { CartItemModel } from 'src/shared/models/carts.model';
import { MenuModel } from 'src/shared/models/menus.model';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { CartsRepo } from 'src/shared/repository/carts.repo';

@Injectable()
export class OrdersService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly cartsService: CartsService,
    private readonly menuService: MenusService,
    private readonly cartsRepo: CartsRepo,
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
    const availableMenus = await this.menuService.getOutletAvailableMenus(
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
    const menus = await this.menuService.getMenus(availableMenuIds);

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
      const order = await this.createOrder(trx, {
        outlet_id: cart.outlet_id,
        user_id: userId,
        total: total,
      });

      // Create the order items in the database
      await this.createOrderItems(trx, order.id, orderItems);

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

  private async createOrder(trx: Transaction<DB>, order: Partial<OrderModel>) {
    const q = trx
      .insertInto('orders')
      .values({
        outlet_id: order.outlet_id,
        user_id: order.user_id,
        total: order.total,
      })
      .returning('id');

    return await q.executeTakeFirstOrThrow();
  }

  private async createOrderItems(
    trx: Transaction<DB>,
    orderId: number,
    orderItems: Partial<OrderItemModel>[],
  ) {
    const values: InsertObjectOrList<DB, 'order_items'>[] = [];

    orderItems.forEach((item) => {
      values.push({
        order_id: orderId,
        menu_id: item.menu_id,
        quantity: item.quantity,
        sub_total: item.sub_total,
      });
    });

    const q = trx.insertInto('order_items').values(values);

    return await q.executeTakeFirstOrThrow();
  }
}
