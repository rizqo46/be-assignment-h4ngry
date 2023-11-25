import { Controller, Get, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { CartsService } from './carts.service';
import { JWTGuard } from 'src/auth/auth.guard';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @UseGuards(JWTGuard)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Request() req) {
      return req.user
  }
}
