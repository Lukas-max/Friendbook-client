import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrivateChatMessage } from '../model/chat/privateChatMessage';
import { PublicChatMessage } from '../model/chat/publicChatMessage';
import { Chunk } from '../model/data/chunk';
import { UserData } from '../model/account/userData';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(private http: HttpClient) { }

    findPublicMessages(limit: string, offset: string): Observable<Chunk<PublicChatMessage>> {
        return this.http.get<Chunk<PublicChatMessage>>(`${environment.backendUrl}/api/chat`, { params: { limit: limit, offset: offset } });
    }

    findPrivateMessages(senderUUID: string, receiverUUID: string, limit: string, offset: string): Observable<Chunk<PrivateChatMessage>> {
        return this.http.get<Chunk<PrivateChatMessage>>(`${environment.backendUrl}/api/chat/${senderUUID}/${receiverUUID}`,
            { params: { limit: limit, offset: offset } });
    }

    getUserData(): Observable<UserData[]> {
        return this.http.get<UserData[]>(`${environment.backendUrl}/api/chat/pending-messages`);
    }

}