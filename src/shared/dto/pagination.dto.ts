import { Type } from "class-transformer";

export class PaginationReqDto {
    @Type(() => Number)
    cursor: number;

    @Type(() => Number)
    pageSize: number;

    search: string | null;
}

export class PaginationRespDto {
    constructor(data: any, nextCursor: number | null, pageSize: number) {
        this.data = data
        this.nextCursor = nextCursor
        this.pageSize = pageSize
    }

    nextCursor: number | null;
    pageSize: number;
    data: any;
} 