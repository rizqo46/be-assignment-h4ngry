import { Injectable } from '@nestjs/common';
import { InjectKysely } from "nestjs-kysely";
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely'

@Injectable()
export class AuthService {
    constructor(@InjectKysely() private readonly db: Kysely<DB>) { }
}
