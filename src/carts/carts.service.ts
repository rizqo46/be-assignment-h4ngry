import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { CartItemModel, CartModel } from 'src/shared/models/carts.model';
import {
  CartItemRespDto,
  CartsPaginationRespDto,
  CartsRespDto,
} from './dto/get.carts.dto';
import { PaginationReqDtoV2 } from 'src/shared/dto/pagination.dto';
import { OutletsRepo } from 'src/shared/repository/outlets.repo';
import { AddToCartDto } from './dto/carts.dto';
import { CartsRepo } from 'src/shared/repository/carts.repo';

@Injectable()
export class CartsService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly outletsRepo: OutletsRepo,
    private readonly cartsRepo: CartsRepo,
  ) {}

  async addCartItem(
    cartReq: Partial<CartModel>,
    cartItemReq: Partial<CartItemModel>,
  ) {
    return await this.db.transaction().execute(async (trx) => {
      // Upsert cart
      const cart = await this.cartsRepo.upsertCart(trx, cartReq);

      // Upsert cart item
      return await this.cartsRepo.upsertCartItem(trx, cart.id, cartItemReq);
    });
  }

  async addCartItemV2(reqBody: AddToCartDto, userId: number) {
    const outlet = await this.outletsRepo.findOne(this.db, reqBody.outletUuid);
    if (!outlet) {
      throw new NotFoundException('outlet not found');
    }
  }

  async getUserCartsWithItems(
    userId: number,
    paginationReq: PaginationReqDtoV2,
  ) {
    // Get carts
    const carts = await this.cartsRepo.getUserCartsWithOutlet(
      this.db,
      userId,
      paginationReq,
    );

    // Define carts response
    const cartsResp: CartsRespDto[] = [];

    for (let i = 0; i < carts.length; i++) {
      const cart = carts[i];

      // get cart items for every cart
      const cartItems = await this.cartsRepo.getCartItemsWithMenu(
        this.db,
        cart,
      );

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

  async validateCartItem(itemUuid: string, userId: number) {
    const cartItem = await this.cartsRepo.getCartItemWithCart(
      this.db,
      itemUuid,
    );
    if (!cartItem) {
      throw new NotFoundException('cart item is not found');
    }

    if (cartItem.user_id != userId) {
      throw new ForbiddenException('cart item is not belong to user');
    }

    return cartItem;
  }

  async updateCartItem(data: Partial<CartItemModel>) {
    return await this.db.transaction().execute(async (trx) => {
      await this.cartsRepo.updateCartItemQuantity(
        trx,
        data.uuid,
        data.quantity,
      );
      return await this.cartsRepo.updateCartMarkAsUpdated(trx, data.cart_id);
    });
  }

  async deleteCartItem(itemUuid: string, cartId: number) {
    return await this.db.transaction().execute(async (trx) => {
      await this.cartsRepo.deleteCartItem(trx, itemUuid);
      return await this.cartsRepo.validateCartAfterRemoveItem(trx, cartId);
    });
  }

  async getAndValidateCart(cartUuid: string, userId: number) {
    const cart = await this.cartsRepo.getCart(this.db, cartUuid);

    if (cart.user_id != userId) {
      throw new ForbiddenException('cart item is not belong to user');
    }

    return cart;
  }

  async deleteCartAndItsItems(cartId: number) {
    return await this.db.transaction().execute(async (trx) => {
      //  Delete cart item first, since its depend on cart
      await this.cartsRepo.deleteCartItems(trx, cartId);

      // Delete cart
      return await this.cartsRepo.deleteCart(trx, cartId);
    });
  }
}
