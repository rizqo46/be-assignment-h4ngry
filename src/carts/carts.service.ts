import { Injectable } from '@nestjs/common';
import { InjectKysely } from "nestjs-kysely";
import { CartItems, DB } from 'src/shared/models/d.db';
import { Kysely, sql } from 'kysely'
import { CartItemModel, CartModel } from 'src/shared/models/carts.model';

@Injectable()
export class CartsService {
    constructor(@InjectKysely() private readonly db: Kysely<DB>) { }

    addCartItem(cartReq: Partial<CartModel>, cartItemReq: Partial<CartItemModel>) {
        return this.db.transaction().execute(async (trx) => {
            // Define query to insert cart
            let qInsertCart = trx.insertInto("carts")

            // Define cart value
            qInsertCart = qInsertCart.values({
                outlet_id: cartReq.outlet_id,
                user_id: cartReq.user_id,
            })

            // Handle on conflict insert cart
            qInsertCart = qInsertCart.onConflict((onConflict) => {
                return onConflict.
                    column("outlet_id").
                    column("user_id").
                    doUpdateSet({
                        updated_at: (eb) => eb.ref("excluded.updated_at")
                    })
            })

            // Get inserted cart
            let cart = await qInsertCart.returning(["id", "uuid"]).executeTakeFirstOrThrow()

            // Define query to insert cart item
            let qInsertCartItem = trx.insertInto("cart_items")

            // Define cart item value
            qInsertCartItem = qInsertCartItem.values({
                cart_id: cart.id,
                menu_id: cartItemReq.menu_id,
                quantity: cartItemReq.quantity,
            })

            // Handle on conflict insert cart
            qInsertCartItem = qInsertCartItem.onConflict((onConflict) => {
                return onConflict.
                    column('cart_id').
                    column('menu_id').
                    doUpdateSet({
                        // On conflict do update to add quantity 
                        quantity: sql<number>`cart_items.quantity + ${cartItemReq.quantity}`
                    })
            })

            return await qInsertCartItem.execute()

        })
    }
}
