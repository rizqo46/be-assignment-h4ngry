import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import {
  PaginationReqDto,
  getPaginationNextCursor,
} from 'src/shared/dto/pagination.dto';
import {
  MenuModel,
  OutletAndMenuModel,
  OutletMenuModel,
} from 'src/shared/models/menus.model';
import { OutletMenuDto, OutletMenuRespDto } from './dto/menus.dto';
import { MenusRepo } from 'src/shared/repository/menus.repo';
import { OutletsService } from 'src/outlets/outlets.service';

@Injectable()
export class MenusService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly menusRepo: MenusRepo,
    private readonly outletsService: OutletsService,
  ) {}

  async findOutletMenus(outletUuid: string, req: PaginationReqDto) {
    const outlet = await this.outletsService.findOne(outletUuid);

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
    const nextCursor = getPaginationNextCursor(outletMenus, req.pageSize);

    const outletMenusDto: OutletMenuDto[] = [];
    outletMenus.forEach((element) => {
      outletMenusDto.push(new OutletMenuDto(element));
    });

    return new OutletMenuRespDto(outletMenusDto, nextCursor, req.pageSize);
  }

  // need to remove
  async findOne(criteria: Partial<MenuModel>) {
    const menu = await this.menusRepo.findOne(this.db, {
      uuid: criteria.uuid,
    });

    if (!menu) {
      throw new NotFoundException('menu not found');
    }
    return menu;
  }

  // need to remove
  async checkOutletMenuAvailability(criteria: Partial<OutletMenuModel>) {
    const outletMenu = await this.menusRepo.findOutletMenu(this.db, criteria);
    if (!outletMenu.is_available) {
      throw new BadRequestException('menu is not available in selected outlet');
    }
  }
}
