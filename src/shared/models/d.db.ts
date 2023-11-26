import type { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<
  string,
  bigint | number | string,
  bigint | number | string
>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface CartItems {
  cart_id: number;
  created_at: Generated<Timestamp>;
  menu_id: number;
  quantity: number;
  updated_at: Generated<Timestamp>;
  uuid: Generated<string>;
}

export interface Carts {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  outlet_id: number;
  updated_at: Generated<Timestamp>;
  user_id: number;
  uuid: Generated<string>;
}

export interface Menus {
  created_at: Generated<Timestamp>;
  description: string;
  id: Generated<number>;
  image: string;
  name: string;
  price: number;
  src_doc: Generated<string>;
  uuid: Generated<string>;
}

export interface Outlets {
  address: string;
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  latitude: number;
  longitude: number;
  name: string;
  src_doc: Generated<string>;
  uuid: Generated<string>;
}

export interface OutletsMenus {
  created_at: Generated<Timestamp>;
  is_available: boolean;
  menu_id: number;
  outlet_id: number;
  updated_at: Generated<Timestamp>;
}

export interface SchemaMigrations {
  dirty: boolean;
  version: Int8;
}

export interface Users {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  username: string;
}

export interface DB {
  cart_items: CartItems;
  carts: Carts;
  menus: Menus;
  outlets: Outlets;
  outlets_menus: OutletsMenus;
  schema_migrations: SchemaMigrations;
  users: Users;
}
