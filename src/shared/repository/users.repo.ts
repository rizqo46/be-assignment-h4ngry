import { Injectable } from '@nestjs/common';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';

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
