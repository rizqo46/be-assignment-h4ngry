import { Injectable } from '@nestjs/common';
import { PaginationReqDto } from 'src/shared/dto/pagination.dto';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { MenuModel, OutletMenuModel } from '../models/menus.model';

@Injectable()
export class UsersRepo {
  async findOne(db: Kysely<DB>, username: string) {
    return await db
      .selectFrom('users')
      .where('username', '=', username)
      .selectAll()
      .executeTakeFirst();
  }
}
