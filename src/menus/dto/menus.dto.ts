import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationRespDto } from 'src/shared/dto/pagination.dto';
import { OutletAndMenuModel } from 'src/shared/models/menus.model';

export class OutletMenuDto {
  constructor(outletModel: Partial<OutletAndMenuModel>) {
    this.name = outletModel.name;
    this.uuid = outletModel.uuid;
    this.description = outletModel.description;
    this.image = outletModel.image;
    this.price = outletModel.price;
    this.isAvailable = outletModel.is_available;
  }

  isAvailable: boolean;

  @ApiProperty({ example: 'Creamy Alfredo sauce with grilled chicken' })
  description: string;

  @ApiProperty({ example: 'chicken_alfredo.jpg' })
  image: string;

  @ApiProperty({ example: 'Chicken Alfredo Pasta' })
  name: string;

  @ApiProperty({ example: 'a5b7f222-8b80-11ee-aa76-2f449b6951b6' })
  uuid: string;

  @ApiProperty({ example: 90000 })
  price: number;
}

export class OutletMenuRespDto extends PaginationRespDto<OutletMenuDto> {
  @Type(() => OutletMenuDto)
  data: OutletMenuDto[];
}
