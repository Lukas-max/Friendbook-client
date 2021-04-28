import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrivateChatMessage } from '../model/privateChatMessage';
import { PublicChatMessage } from '../model/publicChatMessage';
import { Chunk } from '../model/chunk';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(private http: HttpClient) { }

    findPublicMessages(limit: string, offset: string): Observable<Chunk<PublicChatMessage>> {
        return this.http.get<Chunk<PublicChatMessage>>(`http://localhost:9010/api/chat`, { params: { limit: limit, offset: offset } });
    }

    findPrivateMessages(senderUUID: string, receiverUUID: string, limit: string, offset: string): Observable<Chunk<PrivateChatMessage>> {
        return this.http.get<Chunk<PrivateChatMessage>>(`http://localhost:9010/api/chat/${senderUUID}/${receiverUUID}`,
            { params: { limit: limit, offset: offset } });
    }
}