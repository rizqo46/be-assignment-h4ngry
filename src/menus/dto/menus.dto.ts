import { OutletAndMenuModel } from "src/shared/models/menus.model"

export class OutletMenuDto {
    constructor(outletModel: Partial<OutletAndMenuModel>) {
        this.name = outletModel.name
        this.uuid = outletModel.uuid
        this.description = outletModel.description
        this.image = outletModel.image
        this.price = outletModel.price
        this.is_available = outletModel.is_available
    }
    
    is_available: boolean;
    description: string;
    image: string;
    name: string;
    uuid: string;
    price: number;
}