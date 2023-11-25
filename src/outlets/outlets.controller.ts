import { Controller } from '@nestjs/common';
import { OutletsService } from './outlets.service';
import { Get, Query } from '@nestjs/common';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { PaginationReqDto, PaginationRespDto } from 'src/shared/dto/pagination.dto';

@Controller('outlets')
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}
  
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() req: PaginationReqDto) {
    let outlets = await this.outletsService.findAll(req)
    return this.outletsService.parseFindAllResponse(req, outlets)
  }
}
