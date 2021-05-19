export interface FeedComment {
    id?: number;
    feedId: number;
    username: string;
    userUUID: string;
    content: string;
    timestamp: number;
    lastUpdated?: number;
}