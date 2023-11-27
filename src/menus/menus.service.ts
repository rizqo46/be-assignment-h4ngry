import { Injectable, NotFoundException } from '@nestjs/common';
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
import { OutletsRepo } from 'src/shared/repository/outlets.repo';
import { MenusRepo } from 'src/shared/repository/menus.repo';

@Injectable()
export class MenusService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly outletsRepo: OutletsRepo,
    private readonly menusRepo: MenusRepo,
  ) {}

  async findOutletMenus(outletUuid: string, req: PaginationReqDto) {
    const outlet = await this.outletsRepo.findOne(this.db, outletUuid);
    if (!outlet) {
      throw new NotFoundException("outlet isn't found");
    }

    const outletMenus = await this.menusRepo.findOutletMenus(
      this.db,
      outlet.id,
      req,
    );

    return await this.parseFindAllResponse(req, outletMenus);
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
    return await this.menusRepo.findOne(this.db, criteria);
  }

  async findOutletMenu(criteria: Partial<OutletMenuModel>) {
    return await this.menusRepo.findOutletMenu(this.db, criteria);
  }
}
