import { CartItemModel, CartItemWithMenuModel, CartWithOutletModel } from "src/shared/models/carts.model";

export class CartItemRespDto {
    constructor(data: Partial<CartItemWithMenuModel>) {
        this.uuid = data.uuid
        this.updatedAt = data.updated_at
        this.quantity = data.quantity
        this.isMenuAvailable = data.is_available
        this.menuName = data.name
        this.menuPrice = data.price
        this.menuImage = data.image
    }

    uuid: string;
    quantity: number;
    updatedAt: Date;
    isMenuAvailable: boolean;
    menuName: string;
    menuImage: string;
    menuPrice: number;
}

export class CartsRespDto {
    constructor(data: Partial<CartWithOutletModel>, items: CartItemRespDto[]) {
        this.uuid = data.uuid
        this.updatedAt = data.updated_at
        this.outletUuid = data.outlet_uuid
        this.outletName = data.outlet_name
        this.items = items
    }

    uuid: string;
    updatedAt: Date;
    outletName: string;
    outletUuid: string;
    items: CartItemRespDto[];
}