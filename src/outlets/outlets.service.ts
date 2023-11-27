import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaginationReqDto,
  getPaginationNextCursor,
} from 'src/shared/dto/pagination.dto';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { OutletDto, OutletRespDto } from './dto/outlets.dto';
import { OutletModel } from 'src/shared/models/outlets.model';
import { OutletsRepo } from 'src/shared/repository/outlets.repo';

@Injectable()
export class OutletsService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly outletsRepo: OutletsRepo,
  ) {}

  async findAll(req: PaginationReqDto) {
    const outlets = await this.outletsRepo.findMany(this.db, req);
    return await this.parseFindAllResponse(req, outlets);
  }

  async parseFindAllResponse(
    req: PaginationReqDto,
    outlets: Partial<OutletModel>[],
  ): Promise<OutletRespDto> {
    const nextCursor = getPaginationNextCursor(outlets, req.pageSize);
    const outletsDto: OutletDto[] = [];
    outlets.forEach((element) => {
      outletsDto.push(new OutletDto(element));
    });

    return new OutletRespDto(outletsDto, nextCursor, req.pageSize);
  }

  async findOne(uuid: string) {
    const outlet = await this.outletsRepo.findOne(this.db, uuid);
    if (!outlet) {
      throw new NotFoundException('outlet not found');
    }

    return outlet;
  }
}
