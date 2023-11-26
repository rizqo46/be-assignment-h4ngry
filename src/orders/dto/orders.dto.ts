import { IsUUID } from "class-validator";

export class OrderReqDto {
    @IsUUID()
    cartUuid: string;
}