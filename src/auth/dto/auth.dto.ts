import { ApiProperty } from '@nestjs/swagger';

export class AuthReqDto {
  @ApiProperty({ examples: ['h4ngry1', 'hunger'] })
  username: string;
}

export class AuthRespDto {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiaDRuZ3J5MSIsImlhdCI6MTcwMDg5MzQ0MSwiZXhwIjoxNzUyNzMzNDQxfQ.EXDh5f1hUXcHKDV2Gcr3LZqUFKbDZqQOvQLtX9NB9xg',
  })
  accessToken: string;
}
