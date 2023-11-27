import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely, Transaction, sql } from 'kysely';
import {
  CartItemModel,
  CartModel,
  CartWithOutletModel,
} from 'src/shared/models/carts.model';
import {
  CartItemRespDto,
  CartsPaginationRespDto,
  CartsRespDto,
} from './dto/get.carts.dto';
import {
  PaginationReqDto,
  PaginationReqDtoV2,
} from 'src/shared/dto/pagination.dto';

@Injectable()
export class CartsService {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  private async upsertCart(trx: Transaction<DB>, cartReq: Partial<CartModel>) {
    let query = trx.insertInto('carts');

    // Define cart value
    query = query.values({
      outlet_id: cartReq.outlet_id,
      user_id: cartReq.user_id,
    });

    // Handle on conflict insert cart
    query = query.onConflict((onConflict) => {
      return onConflict
        .column('outlet_id')
        .column('user_id')
        .doUpdateSet({
          updated_at: (eb) => eb.ref('excluded.updated_at'),
        });
    });

    return await query.returning(['id', 'uuid']).executeTakeFirstOrThrow();
  }

  private async upsertCartItem(
    trx: Transaction<DB>,
    cartId: number,
    cartItemReq: Partial<CartItemModel>,
  ) {
    // Define query to insert cart item
    let query = trx.insertInto('cart_items');

    // Define cart item value
    query = query.values({
      cart_id: cartId,
      menu_id: cartItemReq.menu_id,
      quantity: cartItemReq.quantity,
    });

    // Handle on conflict insert cart
    query = query.onConflict((onConflict) => {
      return onConflict
        .column('cart_id')
        .column('menu_id')
        .doUpdateSet({
          // On conflict do update to add quantity
          quantity: sql<number>`cart_items.quantity + ${cartItemReq.quantity}`,
        });
    });

    return await query.execute();
  }

  async addCartItem(
    cartReq: Partial<CartModel>,
    cartItemReq: Partial<CartItemModel>,
  ) {
    return await this.db.transaction().execute(async (trx) => {
      // Upsert cart
      const cart = await this.upsertCart(trx, cartReq);

      // Upsert cart item
      return await this.upsertCartItem(trx, cart.id, cartItemReq);
    });
  }

  async getUserCartsWithItems(
    userId: number,
    paginationReq: PaginationReqDtoV2,
  ) {
    // Get carts
    const carts = await this.getUserCartsWithOutlet(userId, paginationReq);

    // Define carts response
    const cartsResp: CartsRespDto[] = [];

    for (let i = 0; i < carts.length; i++) {
      const cart = carts[i];

      // get cart items for every cart
      const cartItems = await this.getCartItemsWithMenu(cart);

      const cartItemsResp: CartItemRespDto[] = [];
      cartItems.forEach((item) => {
        // Convert item to response
        cartItemsResp.push(new CartItemRespDto(item));
      });

      // Populate carts response
      cartsResp.push(new CartsRespDto(cart, cartItemsResp));
    }

    return new CartsPaginationRespDto(
      cartsResp,
      paginationReq.page,
      paginationReq.pageSize,
    );
  }

  private async getUserCartsWithOutlet(
    userId: number,
    paginationReq: PaginationReqDtoV2,
  ) {
    paginationReq.page = paginationReq.page || 1;
    paginationReq.pageSize = paginationReq.pageSize || 2;
    const page = paginationReq.page;
    const pageSize = paginationReq.pageSize;
    const offset = (page - 1) * pageSize;

    let query = this.db
      .selectFrom('carts')
      .leftJoin('outlets', 'carts.outlet_id', 'outlets.id')
      .select([
        'carts.id',
        'carts.uuid',
        'carts.updated_at',
        'outlets.name as outlet_name',
        'outlets.uuid as outlet_uuid',
      ]);

    query = query.offset(offset).limit(pageSize);

    query = query.where('carts.user_id', '=', userId);

    query = query.orderBy('carts.updated_at desc');

    return query.execute();
  }

  async getCartItemsWithMenu(cart: Partial<CartWithOutletModel>) {
    let query = this.db
      .selectFrom('cart_items')
      .leftJoin('menus', 'menus.id', 'cart_items.menu_id')
      .leftJoin('outlets_menus', (join) =>
        // I notice bug on join with multiple condition :(
        join
          .on('outlets_menus.outlet_id', '=', cart.outlet_id)
          .onRef('cart_items.menu_id', '=', 'outlets_menus.menu_id'),
      )
      .select([
        'cart_items.uuid',
        'cart_items.quantity',
        'cart_items.updated_at',
        'outlets_menus.is_available as is_available',
        'menus.name',
        'menus.price',
        'menus.image',
      ]);

    query = query.where('cart_items.cart_id', '=', cart.id);

    query = query.orderBy('cart_items.updated_at desc');

    return await query.execute();
  }

  async validateCartItem(itemUuid: string, userId: number) {
    const cartItem = await this.getCartItemWithCart(itemUuid);
    if (!cartItem) {
      throw new NotFoundException('cart item is not found');
    }

    if (cartItem.user_id != userId) {
      throw new ForbiddenException('cart item is not belong to user');
    }

    return cartItem;
  }

  async getCartItemWithCart(itemUuid: string) {
    let query = this.db
      .selectFrom('cart_items')
      .innerJoin('carts', 'cart_items.cart_id', 'carts.id')
      .select(['carts.user_id', 'cart_items.cart_id', 'cart_items.quantity']);

    query = query.where('cart_items.uuid', '=', itemUuid);

    return await query.executeTakeFirst();
  }

  async updateCartItem(data: Partial<CartItemModel>) {
    return await this.db.transaction().execute(async (trx) => {
      await this.updateCartItemQuantity(trx, data.uuid, data.quantity);
      return await this.updateCartMarkAsUpdated(trx, data.cart_id);
    });
  }

  private async updateCartItemQuantity(
    trx: Transaction<DB>,
    uuid: string,
    quantity: number,
  ) {
    return await trx
      .updateTable('cart_items')
      .set({
        quantity: quantity,
      })
      .where('cart_items.uuid', '=', uuid)
      .executeTakeFirstOrThrow();
  }

  private async updateCartMarkAsUpdated(trx: Transaction<DB>, cartId: number) {
    return await trx
      .updateTable('carts')
      .set({ updated_at: sql<Date>`NOW()` })
      .where('carts.id', '=', cartId)
      .execute();
  }

  async deleteCartItem(itemUuid: string) {
    return await this.db
      .deleteFrom('cart_items')
      .where('uuid', '=', itemUuid)
      .executeTakeFirst();
  }

  async getCart(cartUuid: string) {
    const cart = await this.db
      .selectFrom('carts')
      .where('uuid', '=', cartUuid)
      .select(['id', 'user_id', 'outlet_id'])
      .executeTakeFirst();

    if (!cart) {
      throw new NotFoundException('cart is not found');
    }

    return cart;
  }

  async validateCart(cartUuid: string, userId: number) {
    const cart = await this.getCart(cartUuid);

    if (cart.user_id != userId) {
      throw new ForbiddenException('cart item is not belong to user');
    }

    return cart;
  }

  async deleteCartAndItsItems(cartId: number) {
    return await this.db.transaction().execute(async (trx) => {
      //  Delete cart item first, since its depend on cart
      await this.deleteCartItems(trx, cartId);

      // Delete cart
      return await this.deleteCart(trx, cartId);
    });
  }

  async getCartItems(cartId: number) {
    let query = this.db
      .selectFrom('cart_items')
      .select(['menu_id', 'quantity'])
      .orderBy('cart_items.menu_id asc');

    query = query.where('cart_id', '=', cartId);

    return await query.execute();
  }

  async lockCart(trx: Transaction<DB>, cartId: number) {
    return trx
      .selectFrom('carts')
      .select('uuid')
      .where('id', '=', cartId)
      .forUpdate()
      .executeTakeFirstOrThrow();
  }

  async lockCartItems(trx: Transaction<DB>, cartId: number) {
    return trx
      .selectFrom('cart_items')
      .select('uuid')
      .where('cart_id', '=', cartId)
      .forUpdate()
      .executeTakeFirstOrThrow();
  }

  async deleteCartItems(trx: Transaction<DB>, cartId: number) {
    return trx
      .deleteFrom('cart_items')
      .where('cart_id', '=', cartId)
      .executeTakeFirstOrThrow();
  }

  async deleteCart(trx: Transaction<DB>, cartId: number) {
    return trx
      .deleteFrom('carts')
      .where('id', '=', cartId)
      .executeTakeFirstOrThrow();
  }
}
