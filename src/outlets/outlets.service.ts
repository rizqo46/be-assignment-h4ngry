import { Injectable } from '@nestjs/common';
import { PaginationReqDto, PaginationRespDto } from 'src/shared/dto/pagination.dto';
import { InjectKysely } from "nestjs-kysely";
import { DB } from 'src/shared/models/d.db';
import { Kysely } from 'kysely'
import { OutletDto } from './dto/outlets.dto';
import { OutletModel } from 'src/shared/models/outlets.model';

@Injectable()
export class OutletsService {
    constructor(@InjectKysely() private readonly db: Kysely<DB>) { }

    /**
     * Retrieves a list of outlets based on the provided pagination request.
     * @param req - The pagination request object containing parameters such as page size, cursor, and search term.
     * @returns A list of outlets that match the pagination criteria specified in the `req` object.
     */
    async findAll(req: PaginationReqDto) {
        req.pageSize = req.pageSize || 5
        const pageSize = req.pageSize;
        const cursor = req.cursor;
        const search = req.search;

        let query = this.db.
            selectFrom("outlets").
            limit(pageSize).
            select(["address", "uuid", "id", "name", "latitude", "longitude"]);

        if (cursor) {
            query = query.where("id", ">=", cursor).offset(1);
        }

        if (search) {
            query = query.where("src_doc", "@@", search + ":*");
        }

        return await query.execute();
    }

    async parseFindAllResponse(req: PaginationReqDto, outlets: Partial<OutletModel>[]): Promise<PaginationRespDto> {
        let nextCursor = outlets.length != 0 &&
            outlets.length == req.pageSize ? outlets[outlets.length - 1].id : null

        let outletsDto: OutletDto[] = []
        outlets.forEach(element => {
            outletsDto.push(new OutletDto(element));
        });


        return new PaginationRespDto(outletsDto, nextCursor, req.pageSize)
    }

    async findOne(uuid: string): Promise<Partial<OutletModel>> {
        return await this.db.
            selectFrom("outlets").
            where("uuid", "=", uuid).
            select("id").
            executeTakeFirstOrThrow()
    }
}