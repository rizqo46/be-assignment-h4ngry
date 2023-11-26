import { Injectable } from '@nestjs/common';
import { InjectKysely } from "nestjs-kysely";
import { DB } from 'src/shared/models/d.db';
import { Kysely, sql } from 'kysely'
import { CartItemModel, CartModel, CartWithOutletModel } from 'src/shared/models/carts.model';
import { CartItemRespDto, CartsRespDto } from './dto/get.carts.dto';

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

    async getUserCartsWithItems(userId: number) {
        // Get carts
        let carts = await this.getUserCartsWithOutlet(userId)

        // Define carts response
        let cartsResp: CartsRespDto[] = []

        for (let i = 0; i < carts.length; i++) {
            const cart = carts[i];

            // get cart items for every cart
            let cartItems = await this.getCartItemsWithMenu(cart)

            let cartItemsResp: CartItemRespDto[] = []
            cartItems.forEach(item => {
                // Convert item to response
                cartItemsResp.push(new CartItemRespDto(item))
            });

            // Populate carts response
            cartsResp.push(new CartsRespDto(cart, cartItemsResp))
        }

        return cartsResp
    }

    async getUserCartsWithOutlet(userId: number) {
        let query = this.db.selectFrom("carts").
            leftJoin("outlets", "carts.outlet_id", "outlets.id").
            select([
                "carts.id",
                "carts.uuid",
                "carts.updated_at",
                "outlets.name as outlet_name",
                "outlets.uuid as outlet_uuid",
            ])

        query = query.where("carts.user_id", "=", userId)

        query = query.orderBy("carts.updated_at desc")

        return query.execute()
    }

    async getCartItemsWithMenu(cart: Partial<CartWithOutletModel>) {
        let query = this.db.
            selectFrom("cart_items").
            leftJoin("menus", "menus.id", "cart_items.menu_id").
            leftJoin("outlets_menus", (join) =>
                // I notice bug on join with multiple condition :(
                join.
                    on("outlets_menus.outlet_id", "=", cart.outlet_id).
                    onRef("cart_items.menu_id", "=", "outlets_menus.menu_id")
            ).
            select([
                "cart_items.uuid",
                "cart_items.quantity",
                "cart_items.updated_at",
                "outlets_menus.is_available as is_available",
                "menus.name",
                "menus.price",
                "menus.image",
            ])

        query = query.where("cart_items.cart_id", "=", cart.id)

        query = query.orderBy("cart_items.updated_at desc")

        return await query.execute()
    }
}
