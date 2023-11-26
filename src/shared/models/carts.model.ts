export class CartModel {
  created_at: Date;
  id: number;
  outlet_id: number;
  updated_at: Date;
  user_id: number;
  uuid: string;
}

export class CartWithOutletModel {
  created_at: Date;
  id: number;
  outlet_id: number;
  updated_at: Date;
  user_id: number;
  uuid: string;
  address: string;
  latitude: number;
  longitude: number;
  outlet_name: string;
  outlet_uuid: string;
  src_doc: string;
}

export class CartItemWithMenuModel {
  updated_at: Date;
  uuid: string;
  quantity: number;
  is_available: boolean;
  name: string;
  image: string;
  price: number;
}

export class CartItemModel {
  cart_id: number;
  created_at: Date;
  menu_id: number;
  quantity: number;
  updated_at: Date;
  uuid: string;
}
