export class CartModel {
    created_at: Date;
    id: number;
    outlet_id: number;
    updated_at: Date;
    user_id: number;
    uuid: string;
}

export class CartItemModel {
    cart_id: number;
    created_at: Date;
    menu_id: number;
    quantity: number;
    updated_at: Date;
    uuid: string;
}