import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class PaginationReqDto {
  @Type(() => Number)
  cursor?: number;

  @Type(() => Number)
  pageSize?: number;

  @Type(() => Number)
  page?: number;

  search?: string | null;
}

export class PaginationRespDto<T> {
  constructor(data: T[], nextCursor: number | null, pageSize: number) {
    this.data = data;
    this.nextCursor = nextCursor;
    this.pageSize = pageSize;
  }

  nextCursor?: number | null;
  pageSize: number;

  @IsArray()
  data: T[];
}

export class PaginationReqDtoV2 {
  @Type(() => Number)
  pageSize?: number;

  @Type(() => Number)
  page?: number;
}

export class PaginationRespDtoV2<T> {
  constructor(data: T[], page: number, pageSize: number) {
    this.data = data;
    this.page = page;
    this.pageSize = pageSize;
  }

  page: number;
  pageSize: number;

  @IsArray()
  data: T[];
}