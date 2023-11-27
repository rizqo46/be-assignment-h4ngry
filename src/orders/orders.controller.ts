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
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JWTGuard)
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(
    @Request() req: RequestExpress,
    @Body() reqBody: OrderReqDto,
  ) {
    return this.ordersService.makeOrder(req['user'].sub, reqBody);
  }
}
