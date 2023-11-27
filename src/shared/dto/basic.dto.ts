import { ApiProperty } from '@nestjs/swagger';

export class SuccessRespDto {
  constructor(message?: string) {
    if (message) {
      this.message = message;
      return;
    }

    this.message = 'success';
  }

  @ApiProperty({ example: 'success' })
  message: string;
}
