import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "h4ngry1" })
  username: string;
}

export class LoginRespDto {
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiaDRuZ3J5MSIsImlhdCI6MTcwMDg5MzQ0MSwiZXhwIjoxNzUyNzMzNDQxfQ.EXDh5f1hUXcHKDV2Gcr3LZqUFKbDZqQOvQLtX9NB9xg" })
  accessToken: string;
}
