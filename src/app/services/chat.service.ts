import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrivateChatMessage } from '../model/privateChatMessage';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    constructor(private http: HttpClient) { }

    findMessages(senderUUID: string, receiverUUID: string): Observable<PrivateChatMessage[]> {
        return this.http.get<PrivateChatMessage[]>(`http://localhost:9010/api/chat/${senderUUID}/${receiverUUID}`);
    }
}