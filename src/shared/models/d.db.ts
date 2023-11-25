import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

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

export interface DB {
  menus: Menus;
  outlets: Outlets;
}
