export interface UserResponseDto {
    userUUID?: string;
    username: string;
    email: string;
    password: string;
    storageSize: number;
    messagePending?: boolean;
}