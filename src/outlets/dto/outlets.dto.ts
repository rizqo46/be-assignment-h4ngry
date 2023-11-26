import { Type } from "class-transformer";
import { PaginationRespDto } from "src/shared/dto/pagination.dto";
import { OutletModel } from "src/shared/models/outlets.model";

export class OutletDto {
    constructor(outletModel: Partial<OutletModel>) {
        this.address = outletModel.address
        this.name = outletModel.name
        this.uuid = outletModel.uuid
        this.latitude = outletModel.latitude
        this.longitude = outletModel.longitude
    }
    address: string;
    latitude: number;
    longitude: number
    name: string;
    uuid: string;   
}

export class OutletRespDto extends PaginationRespDto<OutletDto> {
    @Type(()=> OutletDto)
    data: OutletDto[];
}