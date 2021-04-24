import { FileDataDto } from './fileDataDto';

export class FeedModelDto {
    feedId: number;
    text: string;
    files: boolean;
    images: boolean;
    feedTimestamp: number;
    fileData: FileDataDto[];
    username: string;
    userUUID: string;
}