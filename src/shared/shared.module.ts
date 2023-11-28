import { Module } from '@nestjs/common';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { KyselyModule } from 'nestjs-kysely';
import { ConfigModule } from '@nestjs/config';
import { OutletsRepo } from './repository/outlets.repo';
import { MenusRepo } from './repository/menus.repo';
import { UsersRepo } from './repository/users.repo';
import { CartsRepo } from './repository/carts.repo';
import { OrdersRepo } from './repository/orders.repo';

@Module({
  imports: [
    ConfigModule.forRoot(),
    KyselyModule.forRoot({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
    }),
  ],
  providers: [OutletsRepo, MenusRepo, UsersRepo, CartsRepo, OrdersRepo],
  exports: [OutletsRepo, MenusRepo, UsersRepo, CartsRepo, OrdersRepo],
})
export class SharedModule {}
