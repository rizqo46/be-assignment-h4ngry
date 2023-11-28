import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';
import { PaginationRespDto } from 'src/shared/dto/pagination.dto';
import { OutletModel } from 'src/shared/models/outlets.model';

export class OutletDto {
  constructor(outletModel: Partial<OutletModel>) {
    this.address = outletModel.address;
    this.name = outletModel.name;
    this.uuid = outletModel.uuid;
    this.latitude = outletModel.latitude;
    this.longitude = outletModel.longitude;
  }

  @ApiProperty({ example: 'Jl. Majapahit No.462 A, Pedurungan Tengah' })
  address: string;

  @ApiProperty({ example: -7.007683397188739 })
  latitude: number;

  @ApiProperty({ example: 110.47388333909132 })
  longitude: number;

  @ApiProperty({ example: 'Mataram' })
  name: string;

  @ApiProperty({ example: '5d851804-8cb6-11ee-af3a-8ffbcaf320e2' })
  uuid: string;
}

export class OutletRespDto extends PaginationRespDto<OutletDto> {
  @Type(() => OutletDto)
  data: OutletDto[];
}

export class OutletNearby {
  @Max(90)
  @Min(-90)
  @Type(() => Number)
  @ApiProperty({ example: -7.007683397188739 })
  latitude: number;

  @Max(180)
  @Min(-180)
  @Type(() => Number)
  @ApiProperty({ example: 110.47388333909132 })
  longitude: number;
}
