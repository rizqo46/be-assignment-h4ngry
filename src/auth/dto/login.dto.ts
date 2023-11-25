export class LoginDto {
    username: string;
}

export class LoginRespDto {
    constructor(accessToken: string) {
        this.accessToken = accessToken
    }
    accessToken: string;
}