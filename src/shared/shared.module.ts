import { Module } from '@nestjs/common';
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { KyselyModule } from "nestjs-kysely";
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        KyselyModule.forRoot({
            dialect: new PostgresDialect({
                pool: new Pool({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    port: process.env.DB_PORT,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                }),
            }),
            log: ['query'],
        })
    ],
})


export class SharedModule { }
