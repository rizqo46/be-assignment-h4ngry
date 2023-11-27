import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import {
  CartItemRespDto,
  CartsPaginationRespDto,
  CartsRespDto,
} from './dto/get.carts.dto';
import { PaginationReqDtoV2 } from 'src/shared/dto/pagination.dto';
import { OutletsRepo } from 'src/shared/repository/outlets.repo';
import { AddToCartDto, UpdateCartItemDto } from './dto/carts.dto';
import { CartsRepo } from 'src/shared/repository/carts.repo';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { MenusRepo } from 'src/shared/repository/menus.repo';

@Injectable()
export class CartsService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly outletsRepo: OutletsRepo,
    private readonly cartsRepo: CartsRepo,
    private readonly menusRepo: MenusRepo,
  ) {}

  async addCartItemV2(reqBody: AddToCartDto, userId: number) {
    const outlet = await this.outletsRepo.findOne(this.db, reqBody.outletUuid);
    if (!outlet) {
      throw new NotFoundException('outlet not found');
    }
    const menu = await this.menusRepo.findOne(this.db, {
      uuid: reqBody.menuUuid,
    });
    if (!menu) {
      throw new NotFoundException('menu not found');
    }

    const outletMenu = await this.menusRepo.findOutletMenu(this.db, {
      menu_id: menu.id,
      outlet_id: outlet.id,
    });
    if (!outletMenu.is_available) {
      throw new BadRequestException('menu is not available in selected outlet');
    }

    return await this.db.transaction().execute(async (trx) => {
      // Upsert cart
      const cart = await this.cartsRepo.upsertCart(trx, {
        outlet_id: outlet.id,
        user_id: userId,
      });

      // Upsert cart item
      return await this.cartsRepo.upsertCartItem(trx, cart.id, {
        menu_id: menu.id,
        quantity: reqBody.quantity,
      });
    });
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

  async getAndValidateCartItem(itemUuid: string, userId: number) {
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

  async updateCartItem(
    itemUuid: string,
    reqBody: UpdateCartItemDto,
    userId: number,
  ) {
    const cartItem = await this.getAndValidateCartItem(itemUuid, userId);

    if (cartItem.quantity === reqBody.quantity) {
      return new SuccessRespDto();
    }

    return await this.db.transaction().execute(async (trx) => {
      await this.cartsRepo.updateCartItemQuantity(
        trx,
        itemUuid,
        cartItem.quantity,
      );
      return await this.cartsRepo.updateCartMarkAsUpdated(
        trx,
        cartItem.cart_id,
      );
    });
  }

  async deleteCartItem(itemUuid: string, userId: number) {
    const cartItem = await this.getAndValidateCartItem(itemUuid, userId);
    return await this.db.transaction().execute(async (trx) => {
      await this.cartsRepo.deleteCartItem(trx, itemUuid);
      return await this.cartsRepo.validateCartAfterRemoveItem(
        trx,
        cartItem.cart_id,
      );
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

  async deleteCart(uuid: string, userId: number) {
    const cart = await this.getAndValidateCart(uuid, userId);
    await this.deleteCartAndItsItems(cart.id);
  }
}
