import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationRespDtoV2 } from 'src/shared/dto/pagination.dto';
import {
  CartItemWithMenuModel,
  CartWithOutletModel,
} from 'src/shared/models/carts.model';

export class CartItemRespDto {
  constructor(data: Partial<CartItemWithMenuModel>) {
    this.uuid = data.uuid;
    this.updatedAt = data.updated_at;
    this.quantity = data.quantity;
    this.isMenuAvailable = data.is_available;
    this.menuName = data.name;
    this.menuPrice = data.price;
    this.menuImage = data.image;
  }

  @ApiProperty({ example: 'a5b7f222-8b80-11ee-aa76-2f449b6951b6' })
  uuid: string;

  @ApiProperty({ example: 12 })
  quantity: number;

  updatedAt: Date;
  isMenuAvailable: boolean;

  @ApiProperty({ example: 'Chicken Alfredo Pasta' })
  menuName: string;

  @ApiProperty({ example: 'chicken_alfredo.jpg' })
  menuImage: string;

  @ApiProperty({ example: 30000 })
  menuPrice: number;
}

export class CartsRespDto {
  constructor(data: Partial<CartWithOutletModel>, items: CartItemRespDto[]) {
    this.uuid = data.uuid;
    this.updatedAt = data.updated_at;
    this.outletUuid = data.outlet_uuid;
    this.outletName = data.outlet_name;
    this.items = items;
  }

  @ApiProperty({ example: 'a5b7f222-8b80-11ee-aa76-2f449b6951b6' })
  uuid: string;
  updatedAt: Date;

  @ApiProperty({ example: 'Mataram Semarang' })
  outletName: string;

  @ApiProperty({ example: 'f5b7f222-8b80-11ee-aa76-2f449b6951b6' })
  outletUuid: string;

  items: CartItemRespDto[];
}

export class CartsPaginationRespDto extends PaginationRespDtoV2<CartsRespDto> {
  @Type(() => CartsRespDto)
  data: CartsRespDto[];
}
