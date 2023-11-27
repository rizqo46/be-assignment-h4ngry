import { Module } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { KyselyModule } from 'nestjs-kysely';
import { ConfigModule } from '@nestjs/config';
import { OutletsRepo } from './repository/outlets.repo';
import { MenusRepo } from './repository/menus.repo';
import { UsersRepo } from './repository/users.repo';

@Module({
  imports: [
    ConfigModule.forRoot(),
    KyselyModule.forRoot({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
      log: ['query'],
    }),
  ],
  providers: [OutletsRepo, MenusRepo, UsersRepo],
  exports: [OutletsRepo, MenusRepo, UsersRepo],
})
export class SharedModule {}
