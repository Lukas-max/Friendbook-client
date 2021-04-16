import { Injectable, OnDestroy } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Subscription, Subject } from 'rxjs';
import { ChatModel } from '../model/chatModel';

@Injectable({
    providedIn: 'root'
})
export class SocketService implements OnDestroy {
    socketJs: any;
    stomp: any;
    publicSubscription: Subscription;
    publicSubject: Subject<ChatModel> = new Subject<ChatModel>();

    constructor() { }

    connect(): void {
        this.socketJs = new SockJS('http://localhost:9010/socket/connect');
        this.stomp = Stomp.over(this.socketJs);
        this.stomp.debug = null;

        this.stomp.connect({}, (frame) => {
            console.log('FRAME ' + frame);

            this.publicSubscription = this.stomp.subscribe(`/topic/public`, (chat) => {
                const body: ChatModel = JSON.parse(chat.body);
                this.publicSubject.next(body);
            });

        }, err => {
            console.error(err);
        });
    }

    send(body: string, id: string): void {
        const model: ChatModel = {
            content: body,
            user: id,
            timestamp: new Date().getTime()
        }

        this.stomp.send('/app/send', {}, JSON.stringify(model));
    }

    isConnected(): boolean {
        if (!this.stomp)
            return false;

        return this.stomp.connected;
    }

    ngOnDestroy(): void {
        this._disconnect();
    }

    _disconnect(): void {
        this.stomp.disconnect();
        this.stomp = undefined;
        this.socketJs.close();
        this.socketJs = undefined;
        this.publicSubscription.unsubscribe();
    }

}