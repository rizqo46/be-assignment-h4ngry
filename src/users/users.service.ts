import { Injectable } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely';
import { UserModel } from 'src/shared/models/users.model';
import { UsersRepo } from 'src/shared/repository/users.repo';

@Injectable()
export class UsersService {
  constructor(
    @InjectKysely() private readonly db: Kysely<DB>,
    private readonly usersRepo: UsersRepo,
  ) {}

  async findOne(username: string): Promise<Partial<UserModel>> {
    return await this.usersRepo.findOne(this.db, username);
  }
}
