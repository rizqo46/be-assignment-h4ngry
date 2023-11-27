import { Injectable } from '@nestjs/common';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { OrderItemModel, OrderModel } from '../models/orders.model';
import { InsertObjectOrList } from 'kysely/dist/cjs/parser/insert-values-parser';

@Injectable()
export class OrdersRepo {
  async createOrder(trx: Kysely<DB>, order: Partial<OrderModel>) {
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

  async createOrderItems(
    trx: Kysely<DB>,
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
