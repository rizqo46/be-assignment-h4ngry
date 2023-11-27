import { Injectable } from '@nestjs/common';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { MenuModel, OutletMenuModel } from '../models/menus.model';

@Injectable()
export class MenusRepo {
  async findOutletMenus(
    db: Kysely<DB>,
    outletId: number,
    req: PaginationReqDto,
  ) {
    req.pageSize = req.pageSize || 5;
    const pageSize = req.pageSize;
    const cursor = req.cursor;
    const search = req.search;

    let query = db
      .selectFrom('outlets_menus')
      .innerJoin('menus', 'menus.id', 'outlets_menus.menu_id')
      .where('outlets_menus.outlet_id', '=', outletId)
      .select([
        'outlets_menus.is_available',
        'menus.image',
        'menus.name',
        'menus.description',
        'menus.uuid',
        'menus.id',
      ])
      .selectAll()
      .limit(pageSize);

    if (cursor) {
      query = query.where('menus.id', '>=', cursor).offset(1);
    }

    if (search) {
      query = query.where('menus.src_doc', '@@', search + ':*');
    }

    return await query.execute();
  }

  async findOne(db: Kysely<DB>, criteria: Partial<MenuModel>) {
    let query = db.selectFrom('menus').select('id');

    if (criteria.uuid) {
      query = query.where('uuid', '=', criteria.uuid);
    }

    return await query.executeTakeFirst();
  }

  async findOutletMenu(db: Kysely<DB>, criteria: Partial<OutletMenuModel>) {
    let query = db
      .selectFrom('outlets_menus')
      .select(['menu_id', 'is_available']);

    if (criteria.outlet_id) {
      query = query.where('outlet_id', '=', criteria.outlet_id);
    }

    if (criteria.menu_id) {
      query = query.where('menu_id', '=', criteria.menu_id);
    }

    return await query.executeTakeFirst();
  }

  async getOutletAvailableMenus(
    db: Kysely<DB>,
    outletId: number,
    menusId: number[],
  ) {
    let query = db
      .selectFrom('outlets_menus')
      .select(['menu_id'])
      .orderBy('menu_id asc');

    query = query
      .where('outlet_id', '=', outletId)
      .where('is_available', '=', true);

    if (menusId.length != 0) {
      query = query.where('menu_id', 'in', menusId);
    }

    return await query.execute();
  }

  async getMenus(db: Kysely<DB>, menusId: number[]) {
    let query = db
      .selectFrom('menus')
      .select(['id', 'price'])
      .orderBy('id asc');

    query = query.where('id', 'in', menusId);

    return await query.execute();
  }
}
