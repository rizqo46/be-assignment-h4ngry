import { Injectable } from '@nestjs/common';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { DB } from 'src/shared/models/d.db';
import { Kysely, sql } from 'kysely';
import { OutletNearby } from 'src/outlets/dto/outlets.dto';

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

  async findNearby(db: Kysely<DB>, userLoc: OutletNearby) {
    const distance = sql<string>`loc_point <-> point(${userLoc.latitude}, ${userLoc.longitude})`;
    return await db
      .selectFrom('outlets')
      .select(['address', 'uuid', 'name', 'latitude', 'longitude'])
      .limit(1)
      .orderBy(distance)
      .executeTakeFirst();
  }
}
