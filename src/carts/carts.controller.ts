import { Controller, Get, HttpCode, HttpStatus, UseGuards, Request, Post, Put, Delete, Body, UsePipes, ValidationPipe, BadRequestException, Query, Param, ParseUUIDPipe, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JWTGuard } from 'src/auth/auth.guard';
import { Request as RequestExpress } from 'express';
import { OutletsService } from 'src/outlets/outlets.service';
import { MenusService } from 'src/menus/menus.service';
import { AddToCartDto, UpdateCartDto } from './dto/carts.dto';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('carts')
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly outletService: OutletsService,
    private readonly menuService: MenusService,
  ) { }

  @UseGuards(JWTGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Request() req: RequestExpress) {

    return await this.cartsService.getUserCartsWithItems(req["user"].sub)
  }

  @UseGuards(JWTGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addToCart(@Request() req: RequestExpress, @Body() reqBody: AddToCartDto) {
    let outlet = await this.outletService.findOne(reqBody.outletUuid)
    if (!outlet) {
      throw new NotFoundException("outlet not found")
    }

    let menu = await this.menuService.findOne({ uuid: reqBody.menuUuid })
    if (!menu) {
      throw new NotFoundException("menu not found")
    }

    let outletMenu = await this.menuService.findOutletMenu({ menu_id: menu.id, outlet_id: outlet.id })
    if (!outletMenu.is_available) {
      throw new BadRequestException("menu is not available in selected outlet")
    }

    await this.cartsService.addCartItem(
      {
        outlet_id: outlet.id,
        user_id: req["user"].sub
      },
      {
        menu_id: menu.id,
        quantity: reqBody.quantity
      })

    return new SuccessRespDto()
  }

  @UseGuards(JWTGuard)
  @Put("items/:itemUuid")
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCartItem(
    @Request() req: RequestExpress,
    @Param('itemUuid', new ParseUUIDPipe()) itemUuid: string,
    @Body() reqBody: UpdateCartDto,
  ) {
    let cartItem = await this.cartsService.validateCartItem(itemUuid, req["user"].sub)

    if (cartItem.quantity === reqBody.quantity) {
      return new SuccessRespDto()
    }

    await this.cartsService.updateCartItem({
      cart_id: cartItem.cart_id,
      quantity: reqBody.quantity,
      uuid: itemUuid,
    })

    return new SuccessRespDto()
  }

  @UseGuards(JWTGuard)
  @Delete("items/:itemUuid")
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCartItem(
    @Request() req: RequestExpress,
    @Param('itemUuid', new ParseUUIDPipe()) itemUuid: string,
  ) {
    await this.cartsService.validateCartItem(itemUuid, req["user"].sub)
    await this.cartsService.deleteCartItem(itemUuid)
    return new SuccessRespDto()
  }

  @UseGuards(JWTGuard)
  @Delete(":uuid")
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCart(
    @Request() req: RequestExpress,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,

  ) {
    let cart = await this.cartsService.validateCart(uuid, req["user"].sub)
    await this.cartsService.deleteCart(cart.id)
    return new SuccessRespDto()
  }
}
