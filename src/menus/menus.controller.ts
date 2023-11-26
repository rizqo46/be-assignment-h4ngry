import { Controller, Get, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { MenusService } from './menus.service';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { OutletsService } from 'src/outlets/outlets.service';
import { OutletModel } from 'src/shared/models/outlets.model';
import { UsePipes, ValidationPipe } from '@nestjs/common';


@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly outletsService: OutletsService
  ) { }

  @Get("outlets/:uuid")
  @UsePipes(new ValidationPipe({ transform: true }))
  async findMenusOnOutlet(
    @Param('uuid', new ParseUUIDPipe()) outletUuid: string,
    @Query() req: PaginationReqDto,
  ) {
    let outlet: Partial<OutletModel>

      outlet = await this.outletsService.findOne(outletUuid)
      
      if (!outlet) {
        throw new NotFoundException("outlet isn't found")
      }


    let outletMenus = await this.menusService.findOutletMenus(outlet.id, req)

    return this.menusService.parseFindAllResponse(req, outletMenus)
  }
}
