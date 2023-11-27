import { Injectable } from '@nestjs/common';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';

@Injectable()
export class OutletsRepo {
  async findMany(db: Kysely<DB>, req: PaginationReqDto) {
    req.pageSize = req.pageSize || 5;
    const pageSize = req.pageSize;
    const cursor = req.cursor;
    const search = req.search;

    let query = db
      .selectFrom('outlets')
      .limit(pageSize)
      .select(['address', 'uuid', 'id', 'name', 'latitude', 'longitude']);

    if (cursor) {
      query = query.where('id', '>=', cursor).offset(1);
    }

    if (search) {
      query = query.where('src_doc', '@@', search + ':*');
    }

    return await query.execute();
  }

  async findOne(db: Kysely<DB>, uuid: string) {
    return await db
      .selectFrom('outlets')
      .where('uuid', '=', uuid)
      .select('id')
      .executeTakeFirst();
  }
}
