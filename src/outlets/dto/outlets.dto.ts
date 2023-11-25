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