export class OutletAndMenuModel {
    id: number;
    is_available: boolean;
    description: string;
    image: string;
    name: string;
    uuid: string;
    created_at: Date;
    menu_id: number;
    outlet_id: number;
    updated_at: Date;
    price: number;
    src_doc: string;
}

export class OutletMenuModel {
    created_at: Date;
    is_available: boolean;
    menu_id: number;
    outlet_id: number;
    updated_at: Date;
}

export class MenuModel {
    id: number;
    is_available: boolean;
    description: string;
    image: string;
    name: string;
    uuid: string;
    created_at: Date;
}