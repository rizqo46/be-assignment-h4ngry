import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { UserModel } from 'src/shared/models/users.model';

@Injectable()
export class UsersService {
  constructor(@InjectKysely() private readonly db: Kysely<DB>) {}

  async findOne(username: string): Promise<Partial<UserModel>> {
    return await this.db
      .selectFrom('users')
      .where('username', '=', username)
      .selectAll()
      .executeTakeFirst();
  }
}
