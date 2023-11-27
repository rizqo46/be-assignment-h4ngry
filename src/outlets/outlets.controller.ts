import { Controller } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { Get, Query } from '@nestjs/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { ApiTags } from '@nestjs/swagger';

const outletsControllerName = 'outlets';

@ApiTags(outletsControllerName)
@Controller(outletsControllerName)
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() req: PaginationReqDto) {
    return await this.outletsService.findAll(req);
  }
}
