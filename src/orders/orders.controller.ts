import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JWTGuard } from 'src/auth/auth.guard';
import { Request as RequestExpress } from 'express';
import { OrderReqDto } from './dto/orders.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

const ordersControllerName = 'orders';

@ApiBearerAuth()
@ApiTags(ordersControllerName)
@Controller(ordersControllerName)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JWTGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(
    @Request() req: RequestExpress,
    @Body() reqBody: OrderReqDto,
  ) {
    const userId = req['user'].sub;
    return this.ordersService.makeOrder(userId, reqBody);
  }
}
