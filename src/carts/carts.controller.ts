import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Post,
  Put,
  Delete,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JWTGuard } from 'src/auth/auth.guard';
import { Request as RequestExpress } from 'express';
import { OutletsService } from 'src/outlets/outlets.service';
import { MenusService } from 'src/menus/menus.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/carts.dto';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationReqDtoV2 } from 'src/shared/dto/pagination.dto';

const cartsControllerName = 'carts';

@ApiBearerAuth()
@ApiTags(cartsControllerName)
@Controller(cartsControllerName)
export class CartsController {
  constructor(
    private readonly cartsService: CartsService,
    private readonly outletService: OutletsService,
    private readonly menuService: MenusService,
  ) {}

  @UseGuards(JWTGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addToCart(
    @Request() req: RequestExpress,
    @Body() reqBody: AddToCartDto,
  ) {
    const outlet = await this.outletService.findOne(reqBody.outletUuid);
    if (!outlet) {
      throw new NotFoundException('outlet not found');
    }

    const menu = await this.menuService.findOne({ uuid: reqBody.menuUuid });
    if (!menu) {
      throw new NotFoundException('menu not found');
    }

    const outletMenu = await this.menuService.findOutletMenu({
      menu_id: menu.id,
      outlet_id: outlet.id,
    });
    if (!outletMenu.is_available) {
      throw new BadRequestException('menu is not available in selected outlet');
    }

    await this.cartsService.addCartItem(
      {
        outlet_id: outlet.id,
        user_id: req['user'].sub,
      },
      {
        menu_id: menu.id,
        quantity: reqBody.quantity,
      },
    );

    return new SuccessRespDto();
  }

  @UseGuards(JWTGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAll(
    @Request() req: RequestExpress,
    @Query() reqQuery: PaginationReqDtoV2,
  ) {
    return await this.cartsService.getUserCartsWithItems(
      req['user'].sub,
      reqQuery,
    );
  }

  @UseGuards(JWTGuard)
  @Put('items/:itemUuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCartItem(
    @Request() req: RequestExpress,
    @Param('itemUuid', new ParseUUIDPipe()) itemUuid: string,
    @Body() reqBody: UpdateCartItemDto,
  ) {
    await this.cartsService.updateCartItem(itemUuid, reqBody, req['user'].sub);
    return new SuccessRespDto();
  }

  @UseGuards(JWTGuard)
  @Delete('items/:itemUuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCartItem(
    @Request() req: RequestExpress,
    @Param('itemUuid', new ParseUUIDPipe()) itemUuid: string,
  ) {
    await this.cartsService.deleteCartItem(itemUuid, req['user'].sub);
    return new SuccessRespDto();
  }

  @UseGuards(JWTGuard)
  @Delete(':uuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCart(
    @Request() req: RequestExpress,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    await this.cartsService.deleteCart(uuid, req['user'].sub);
    return new SuccessRespDto();
  }
}
