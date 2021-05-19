export interface IUserDto {
    userId?: number;
    userUUID?: string;
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