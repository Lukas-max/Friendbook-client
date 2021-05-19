export interface ILoginCredentials {
    email: string;
    password: string;
}

export class LoginCredentials implements ILoginCredentials {

    constructor(public email, public password) {
    }
}