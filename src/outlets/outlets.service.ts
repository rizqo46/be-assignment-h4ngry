import { Injectable } from '@nestjs/common';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
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
  ) { }

  async findAll(req: PaginationReqDto) {
    let outlets = await this.outletsRepo.findMany(this.db, req)
    return await this.parseFindAllResponse(req, outlets)
  }

  async parseFindAllResponse(
    req: PaginationReqDto,
    outlets: Partial<OutletModel>[],
  ): Promise<OutletRespDto> {
    const nextCursor =
      outlets.length != 0 && outlets.length == req.pageSize
        ? outlets[outlets.length - 1].id
        : null;

    const outletsDto: OutletDto[] = [];
    outlets.forEach((element) => {
      outletsDto.push(new OutletDto(element));
    });

    return new OutletRespDto(outletsDto, nextCursor, req.pageSize);
  }

  async findOne(uuid: string) {
    return await this.outletsRepo.findOne(this.db, uuid)
  }
}
