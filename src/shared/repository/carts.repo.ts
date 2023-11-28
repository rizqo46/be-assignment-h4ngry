import { Injectable } from '@nestjs/common';
import { DB } from 'src/shared/models/d.db';
import { Kysely, sql } from 'kysely';
import {
  CartItemModel,
  CartModel,
  CartWithOutletModel,
} from '../models/carts.model';
import { PaginationReqDtoV2 } from '../dto/pagination.dto';

@Injectable()
export class CartsRepo {
  async upsertCart(trx: Kysely<DB>, cartReq: Partial<CartModel>) {
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

  async upsertCartItem(trx: Kysely<DB>, cartItemReq: Partial<CartItemModel>) {
    // Define query to insert cart item
    let query = trx.insertInto('cart_items');

    // Define cart item value
    query = query.values({
      cart_id: cartItemReq.cart_id,
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

  async getUserCartsWithOutlet(
    db: Kysely<DB>,
    userId: number,
    paginationReq: PaginationReqDtoV2,
  ) {
    paginationReq.page = paginationReq.page || 1;
    paginationReq.pageSize = paginationReq.pageSize || 2;
    const page = paginationReq.page;
    const pageSize = paginationReq.pageSize;
    const offset = (page - 1) * pageSize;

    let query = db
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

  async getCartItemsWithMenu(
    db: Kysely<DB>,
    cart: Partial<CartWithOutletModel>,
  ) {
    let query = db
      .selectFrom('cart_items')
      .leftJoin('menus', 'menus.id', 'cart_items.menu_id')
      .leftJoin('outlets_menus', (join) => {
        // It seems, I noticed a bug on join with multiple conditions when using Kysely
        // the query result doesnt apply to object
        // in this case produce outlets_menus.is_available not marshall into object
        // make response.is_available always show null
        return join
          .onRef('cart_items.menu_id', '=', 'outlets_menus.menu_id')
          .on('outlets_menus.outlet_id', '=', cart.outlet_id);
      })
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

  async getCart(db: Kysely<DB>, cartUuid: string) {
    return await db
      .selectFrom('carts')
      .where('uuid', '=', cartUuid)
      .select(['id', 'user_id', 'outlet_id'])
      .executeTakeFirst();
  }

  async lockCart(trx: Kysely<DB>, cartId: number) {
    return trx
      .selectFrom('carts')
      .select('uuid')
      .where('id', '=', cartId)
      .forUpdate()
      .executeTakeFirstOrThrow();
  }

  async lockCartItems(trx: Kysely<DB>, cartId: number) {
    return trx
      .selectFrom('cart_items')
      .select('uuid')
      .where('cart_id', '=', cartId)
      .forUpdate()
      .executeTakeFirstOrThrow();
  }

  async deleteCartItems(trx: Kysely<DB>, cartId: number) {
    return trx
      .deleteFrom('cart_items')
      .where('cart_id', '=', cartId)
      .executeTakeFirstOrThrow();
  }

  async deleteCart(trx: Kysely<DB>, cartId: number) {
    return trx
      .deleteFrom('carts')
      .where('id', '=', cartId)
      .executeTakeFirstOrThrow();
  }

  async getCartItemWithCart(db: Kysely<DB>, itemUuid: string) {
    let query = db
      .selectFrom('cart_items')
      .innerJoin('carts', 'cart_items.cart_id', 'carts.id')
      .select(['carts.user_id', 'cart_items.cart_id', 'cart_items.quantity']);

    query = query.where('cart_items.uuid', '=', itemUuid);

    return await query.executeTakeFirst();
  }

  async updateCartItemQuantity(
    trx: Kysely<DB>,
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

  async updateCartMarkAsUpdated(trx: Kysely<DB>, cartId: number) {
    return await trx
      .updateTable('carts')
      .set({ updated_at: sql<Date>`NOW()` })
      .where('carts.id', '=', cartId)
      .execute();
  }

  async getCartItems(dB: Kysely<DB>, cartId: number, limit?: number) {
    let query = dB
      .selectFrom('cart_items')
      .select(['menu_id', 'quantity'])
      .orderBy('cart_items.menu_id asc');

    if (limit) {
      query = query.limit(limit);
    }

    query = query.where('cart_id', '=', cartId);

    return await query.execute();
  }

  async deleteCartItem(trx: Kysely<DB>, itemUuid: string) {
    return await trx
      .deleteFrom('cart_items')
      .where('uuid', '=', itemUuid)
      .executeTakeFirst();
  }
}
