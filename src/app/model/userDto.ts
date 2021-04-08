export interface IUserDto {
    userId?: number;
    username: string;
    email: string;
    password: string;
    isActive?: boolean;
    isLocked?: boolean;
    role?: string;
}

export class UserDto implements IUserDto {

    constructor(public username, public email, public password) {
    }
}