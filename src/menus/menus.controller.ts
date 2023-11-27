import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { OutletsService } from 'src/outlets/outlets.service';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
const menusControllerName = 'menus';

@ApiTags(menusControllerName)
@Controller(menusControllerName)
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly outletsService: OutletsService,
  ) {}

  @Get('outlets/:uuid')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findMenusOnOutlet(
    @Param('uuid', new ParseUUIDPipe()) outletUuid: string,
    @Query() req: PaginationReqDto,
  ) {
    return await this.menusService.findOutletMenus(outletUuid, req);
  }
}
