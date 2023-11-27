export class OrderModel {
  created_at: Date;
  id: number;
  outlet_id: number;
  status: string;
  total: number;
  updated_at: Date;
  user_id: number;
  uuid: string;
}

export class OrderItemModel {
  created_at: Date;
  menu_id: number;
  order_id: number;
  quantity: number;
  sub_total: number;
  updated_at: Date;
  uuid: string;
}
