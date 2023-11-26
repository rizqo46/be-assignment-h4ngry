import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import {
  MenuModel,
  OutletAndMenuModel,
  OutletMenuModel,
} from 'src/shared/models/menus.model';
import { OutletMenuDto, OutletMenuRespDto } from './dto/menus.dto';

@Injectable()
export class MenusService {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  async findOutletMenus(outletId: number, req: PaginationReqDto) {
    req.pageSize = req.pageSize || 5;
    const pageSize = req.pageSize;
    const cursor = req.cursor;
    const search = req.search;

    let query = this.db
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

  async parseFindAllResponse(
    req: PaginationReqDto,
    outletMenus: Partial<OutletAndMenuModel[]>,
  ): Promise<OutletMenuRespDto> {
    const nextCursor =
      outletMenus.length != 0 && outletMenus.length == req.pageSize
        ? outletMenus[outletMenus.length - 1].id
        : null;

    const outletMenusDto: OutletMenuDto[] = [];
    outletMenus.forEach((element) => {
      outletMenusDto.push(new OutletMenuDto(element));
    });

    return new OutletMenuRespDto(outletMenusDto, nextCursor, req.pageSize);
  }
  async findOne(criteria: Partial<MenuModel>): Promise<Partial<MenuModel>> {
    let query = this.db.selectFrom('menus').select('id');

    if (criteria.uuid) {
      query = query.where('uuid', '=', criteria.uuid);
    }

    return await query.executeTakeFirst();
  }

  async findOutletMenu(
    criteria: Partial<OutletMenuModel>,
  ): Promise<Partial<OutletMenuModel>> {
    let query = this.db
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
}
