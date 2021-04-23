import { FileDataDto } from './fileDataDto';

export class FeedModelDto {
    id: number;
    text: string;
    files: boolean;
    images: boolean;
    feedTimestamp: number;
    fileData: FileDataDto[];
    username: string;
    userUUID: string;
}