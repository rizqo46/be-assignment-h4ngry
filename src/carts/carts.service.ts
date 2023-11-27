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
import { CartItemRespDto, CartsRespDto } from './dto/get.carts.dto';

@Injectable()
export class CartsService {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  addCartItem(
    cartReq: Partial<CartModel>,
    cartItemReq: Partial<CartItemModel>,
  ) {
    return this.db.transaction().execute(async (trx) => {
      // Define query to insert cart
      let qInsertCart = trx.insertInto('carts');

      // Define cart value
      qInsertCart = qInsertCart.values({
        outlet_id: cartReq.outlet_id,
        user_id: cartReq.user_id,
      });

      // Handle on conflict insert cart
      qInsertCart = qInsertCart.onConflict((onConflict) => {
        return onConflict
          .column('outlet_id')
          .column('user_id')
          .doUpdateSet({
            updated_at: (eb) => eb.ref('excluded.updated_at'),
          });
      });

      // Get inserted cart
      const cart = await qInsertCart
        .returning(['id', 'uuid'])
        .executeTakeFirstOrThrow();

      // Define query to insert cart item
      let qInsertCartItem = trx.insertInto('cart_items');

      // Define cart item value
      qInsertCartItem = qInsertCartItem.values({
        cart_id: cart.id,
        menu_id: cartItemReq.menu_id,
        quantity: cartItemReq.quantity,
      });

      // Handle on conflict insert cart
      qInsertCartItem = qInsertCartItem.onConflict((onConflict) => {
        return onConflict
          .column('cart_id')
          .column('menu_id')
          .doUpdateSet({
            // On conflict do update to add quantity
            quantity: sql<number>`cart_items.quantity + ${cartItemReq.quantity}`,
          });
      });

      return await qInsertCartItem.execute();
    });
  }

  async getUserCartsWithItems(userId: number) {
    // Get carts
    const carts = await this.getUserCartsWithOutlet(userId);

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

    return cartsResp;
  }

  async getUserCartsWithOutlet(userId: number) {
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
      await trx
        .updateTable('cart_items')
        .set({
          quantity: data.quantity,
        })
        .where('cart_items.uuid', '=', data.uuid)
        .executeTakeFirstOrThrow();

      return await trx
        .updateTable('carts')
        .set({ updated_at: sql<Date>`NOW()` })
        .where('carts.id', '=', data.cart_id)
        .execute();
    });
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

  async deleteCartAndItsItems(id: number) {
    return await this.db.transaction().execute(async (trx) => {
      //  Delete cart item first, since its depend on cart
      await trx
        .deleteFrom('cart_items')
        .where('cart_items.cart_id', '=', id)
        .executeTakeFirstOrThrow();

      // Delete cart
      return await trx
        .deleteFrom('carts')
        .where('id', '=', id)
        .executeTakeFirstOrThrow();
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
