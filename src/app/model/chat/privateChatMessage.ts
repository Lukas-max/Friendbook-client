
export class PrivateChatMessage {
    senderUUID: string;
    senderName: string;
    receiverUUID: string;
    receiverName: string;
    content: string;
    timestamp: number;
    status?: string;
}