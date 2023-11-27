import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  @ApiProperty({example: "6d851804-8cb6-11ee-af3a-8ffbcaf320e3"})
  outletUuid: string;

  @IsUUID()
  @ApiProperty({example: "5d851804-8cb6-11ee-af3a-8ffbcaf320e2"})
  menuUuid: string;

  @IsInt()
  @ApiProperty({example: 1})
  @Min(1)
  quantity: number;
}

export class UpdateCartDto {
  @IsInt()
  @ApiProperty({example: 1})
  @Min(1)
  quantity: number;
}
