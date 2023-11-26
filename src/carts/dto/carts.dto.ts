import { PartialType } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  outletUuid: string;

  @IsUUID()
  menuUuid: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartDto extends PartialType(AddToCartDto) {}
