import { Injectable, OnDestroy } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { PublicChatMessage } from '../model/publicChatMessage';
import { ConnectedUser } from '../model/connectedUser';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root'
})
export class SocketService implements OnDestroy {
    socketJs: any;
    stomp: any;
    connectionSubscription: Subscription;
    connectionSubject: BehaviorSubject<ConnectedUser[]> = new BehaviorSubject<ConnectedUser[]>(null);
    publicSubscription: Subscription;
    publicSubject: Subject<PublicChatMessage> = new Subject<PublicChatMessage>();

    constructor(private authenticationService: AuthenticationService) { }

    connect(): void {
        this.socketJs = new SockJS('http://localhost:9010/socket/connect');
        this.stomp = Stomp.over(this.socketJs);
        this.stomp.debug = null;

        this.stomp.connect({}, (frame) => {
            console.log('FRAME ' + frame);
            this._onConnect();

        }, err => {
            console.error(err);
        });
    }

    _onConnect() {
        this.connectionSubscription = this.stomp.subscribe(`/topic/connection`, (data) => {
            const body: ConnectedUser[] = JSON.parse(data.body);;
            this.connectionSubject.next(body);
        });

        this.publicSubscription = this.stomp.subscribe(`/topic/public`, (chat) => {
            const body: PublicChatMessage = JSON.parse(chat.body);
            this.publicSubject.next(body);
        });

        this._sendWhenConnected();
        window.onbeforeunload = window.onunload = () => this._disconnect();
    }

    _sendWhenConnected() {
        const username = this.authenticationService.getUsername();
        const uuid = this.authenticationService.getLoggedUserId();

        if (!username || !uuid) {
            this.authenticationService.logout();
            throw new Error('Brak poprawnego uwierzytelnienia. Wylogowano.');
        }

        const userConnected: ConnectedUser = {
            username: username,
            userUUID: uuid
        };

        this.stomp.send('/app/logged', {}, JSON.stringify(userConnected));
    }

    _sendWhenDisconnected() {
        const userConnected: ConnectedUser = {
            username: this.authenticationService.getUsername(),
            userUUID: this.authenticationService.getLoggedUserId()
        };

        this.stomp.send('/app/exit', {}, JSON.stringify(userConnected));
    }

    send(body: string, username: string, uuid: string): void {
        const model: PublicChatMessage = {
            content: body,
            username: username,
            userUUID: uuid,
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
        this._sendWhenDisconnected();

        this.stomp.disconnect();
        this.stomp = undefined;
        this.socketJs.close();
        this.socketJs = undefined;
        this.publicSubscription.unsubscribe();
        this.connectionSubscription.unsubscribe();
    }

}