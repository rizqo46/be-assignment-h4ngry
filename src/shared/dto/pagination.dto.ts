import { Type } from "class-transformer";
import { IsArray } from "class-validator";

export class PaginationReqDto {
    @Type(() => Number)
    cursor?: number;

    @Type(() => Number)
    pageSize?: number;

    search?: string | null;
}

export class PaginationRespDto<T> {
    constructor(data: T[], nextCursor: number | null, pageSize: number) {
        this.data = data
        this.nextCursor = nextCursor
        this.pageSize = pageSize
    }

    nextCursor?: number | null;
    pageSize: number;

    @IsArray()
    data: T[];
} 