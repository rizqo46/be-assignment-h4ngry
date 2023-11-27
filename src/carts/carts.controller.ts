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
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JWTGuard } from 'src/auth/auth.guard';
import { Request as RequestExpress } from 'express';
import { AddToCartDto, UpdateCartItemDto } from './dto/carts.dto';
import { SuccessRespDto } from 'src/shared/dto/basic.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationReqDtoV2 } from 'src/shared/dto/pagination.dto';

const cartsControllerName = 'carts';

@ApiBearerAuth()
@ApiTags(cartsControllerName)
@Controller(cartsControllerName)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @UseGuards(JWTGuard)
  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async addToCart(
    @Request() req: RequestExpress,
    @Body() reqBody: AddToCartDto,
  ) {
    const userId = req['user'].sub;
    await this.cartsService.addCartItemV2(reqBody, userId);
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
    const userId = req['user'].sub;
    return await this.cartsService.getUserCartsWithItems(userId, reqQuery);
  }

  @UseGuards(JWTGuard)
  @Put('items/:itemUuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCartItem(
    @Request() req: RequestExpress,
    @Param('itemUuid', new ParseUUIDPipe()) itemUuid: string,
    @Body() reqBody: UpdateCartItemDto,
  ) {
    const userId = req['user'].sub;
    await this.cartsService.updateCartItem(itemUuid, reqBody, userId);
    return new SuccessRespDto();
  }

  @UseGuards(JWTGuard)
  @Delete('items/:itemUuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCartItem(
    @Request() req: RequestExpress,
    @Param('itemUuid', new ParseUUIDPipe()) itemUuid: string,
  ) {
    const userId = req['user'].sub;
    await this.cartsService.deleteCartItem(itemUuid, userId);
    return new SuccessRespDto();
  }

  @UseGuards(JWTGuard)
  @Delete(':uuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteCart(
    @Request() req: RequestExpress,
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
  ) {
    const userId = req['user'].sub;
    await this.cartsService.deleteCart(uuid, userId);
    return new SuccessRespDto();
  }
}
