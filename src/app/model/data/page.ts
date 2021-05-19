export class Page<T> {
    totalItems: number;
    totalPages: number;
    items: number;
    currentPage: number;
    content: T[];
}