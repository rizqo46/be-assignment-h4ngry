import { Controller, Get, HttpCode, HttpStatus, UseGuards, Request, Post, Put, Delete, Body, UsePipes, ValidationPipe, BadRequestException, Query } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JWTGuard } from 'src/auth/auth.guard';
import { Request as RequestExpress } from 'express';
import { OutletsService } from 'src/outlets/outlets.service';
import { MenusService } from 'src/menus/menus.service';
import { AddToCartDto } from './dto/add.carts.dto';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
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
      throw new BadRequestException("outlet not found")
    }

    let menu = await this.menuService.findOne({ uuid: reqBody.menuUuid })
    if (!menu) {
      throw new BadRequestException("menu not found")
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
  @Put("items/:uuid")
  @HttpCode(HttpStatus.OK)
  async updateCartItem(@Request() req) {
    // validate req quantity must not 0
    // get cart item with LOCK
    // update quantity
    return req.user
  }

  @UseGuards(JWTGuard)
  @Delete("items/:uuid")
  @HttpCode(HttpStatus.OK)
  async deleteCartItem(@Request() req) {
    // get cart item
    // delete cart item
    return req.user
  }

  @UseGuards(JWTGuard)
  @Delete(":uuid")
  @HttpCode(HttpStatus.OK)
  async deleteCart(@Request() req) {
    // get cart
    // delete cart item
    // delete cart
    return req.user
  }
}
