import { Controller, Get, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { MenusService } from './menus.service';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { OutletsService } from 'src/outlets/outlets.service';
import { OutletModel } from 'src/shared/models/outlets.model';

@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly outletsService: OutletsService
  ) { }

  @Get("outlets/:uuid")
  async findMenusOnOutlet(
    @Param('uuid', new ParseUUIDPipe()) outletUuid: string,
    @Query() req: PaginationReqDto,
  ) {
    let outlet: Partial<OutletModel>

    try {
      outlet = await this.outletsService.findOne(outletUuid)
    } catch (error) {
      if (error == "Error: no result") {
        throw new NotFoundException("outlet isn't found")
      }

      throw new InternalServerErrorException()
    }

    return outlet
  }
}
