export class SuccessRespDto {
  constructor(message?: string) {
    if (message) {
      this.message = message;
      return;
    }

    this.message = 'success';
  }

  message: string;
}
