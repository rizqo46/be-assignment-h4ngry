import { Injectable } from '@nestjs/common';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';

@Injectable()
export class UsersRepo {
  async findOne(db: Kysely<DB>, username: string) {
    return await db
      .selectFrom('users')
      .where('username', '=', username)
      .select(['id', 'username'])
      .executeTakeFirst();
  }

  async cretae(db: Kysely<DB>, username: string) {
    return await db
      .insertInto('users')
      .values({ username: username })
      .returning(['id', 'username'])
      .executeTakeFirst();
  }
}
