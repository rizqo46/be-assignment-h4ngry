import {
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
import { AddToCartDto, UpdateCartItemDto } from './dto/carts.dto';
import { CartsRepo } from 'src/shared/repository/carts.repo';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { MenusService } from 'src/menus/menus.service';
import { OutletsService } from 'src/outlets/outlets.service';
import { CartItemModel, CartModel } from 'src/shared/models/carts.model';

@Injectable()
export class CartsService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly cartsRepo: CartsRepo,
    private readonly menusService: MenusService,
    private readonly outletsService: OutletsService,
  ) {}

  async addCartItem(reqBody: AddToCartDto, userId: number) {
    // get outlet
    const outlet = await this.outletsService.findOne(reqBody.outletUuid);

    // get menu
    const menu = await this.menusService.findOne({ uuid: reqBody.menuUuid });

    // check/validate menu availability
    await this.menusService.checkOutletMenuAvailability({
      menu_id: menu.id,
      outlet_id: outlet.id,
    });

    return await this.db.transaction().execute(async (trx) => {
      // Upsert cart
      const cart = await this.cartsRepo.upsertCart(trx, {
        outlet_id: outlet.id,
        user_id: userId,
      });

      // Upsert cart item
      return await this.cartsRepo.upsertCartItem(trx, {
        menu_id: menu.id,
        quantity: reqBody.quantity,
        cart_id: cart.id,
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

  async getCartItem(itemUuid: string) {
    const cartItem = await this.cartsRepo.getCartItemWithCart(
      this.db,
      itemUuid,
    );
    if (!cartItem) {
      throw new NotFoundException('cart item is not found');
    }

    return cartItem;
  }

  validateCartItemBelonging(cartItem: Partial<CartItemModel>, userId: number) {
    if (cartItem.user_id != userId) {
      throw new ForbiddenException('cart item is not belong to user');
    }
  }

  async updateCartItem(
    itemUuid: string,
    reqBody: UpdateCartItemDto,
    userId: number,
  ) {
    const cartItem = await this.getCartItem(itemUuid);

    this.validateCartItemBelonging(cartItem, userId);

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
    const cartItem = await this.getCartItem(itemUuid);
    this.validateCartItemBelonging(cartItem, userId);

    return await this.db.transaction().execute(async (trx) => {
      await this.cartsRepo.deleteCartItem(trx, itemUuid);

      // check is exists another item in cart
      const cartItems = await this.cartsRepo.getCartItems(
        trx,
        cartItem.cart_id,
        1,
      );

      // if exists then do nothing
      if (cartItems.length > 0) {
        return;
      }

      // if not do delete cart
      return await this.cartsRepo.deleteCart(trx, cartItem.cart_id);
    });
  }

  async getCart(cartUuid: string) {
    const cart = await this.cartsRepo.getCart(this.db, cartUuid);
    if (!cart) {
      throw new NotFoundException('cart is not found');
    }

    return cart;
  }

  validateCartBelonging(cart: Partial<CartModel>, userId: number) {
    if (cart.user_id != userId) {
      throw new ForbiddenException('cart item is not belong to user');
    }
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
    // Validate is cart belong to user
    const cart = await this.getCart(uuid);

    // Validate is cart belong to user
    this.validateCartBelonging(cart, userId);

    await this.deleteCartAndItsItems(cart.id);
  }
}
