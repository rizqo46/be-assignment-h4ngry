import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class OrderReqDto {
  @IsUUID()
  @ApiProperty({ example: 'a5b7f222-8b80-11ee-aa76-2f449b6951b6' })
  cartUuid: string;
}
