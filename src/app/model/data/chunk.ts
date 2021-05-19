export class Chunk<T> {
    limit: number;
    offset: number;
    content: T[];
}