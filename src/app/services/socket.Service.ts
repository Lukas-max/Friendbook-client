import { Injectable, OnDestroy } from '@angular/core';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { PublicChatMessage } from '../model/publicChatMessage';
import { ConnectedUser } from '../model/connectedUser';
import { AuthenticationService } from './authentication.service';
import { PrivateChatMessage } from '../model/privateChatMessage';
import { FeedModelDto } from '../model/feedModelDto';

@Injectable({
    providedIn: 'root'
})
export class SocketService implements OnDestroy {
    socketJs: any;
    stomp: any;
    connectionSubscription: Subscription;
    connectionSubject: BehaviorSubject<ConnectedUser[]> = new BehaviorSubject<ConnectedUser[]>(null);
    feedSubscription: Subscription;
    feedSubject: Subject<FeedModelDto> = new Subject<FeedModelDto>();
    publicSubscription: Subscription;
    deleteFeedSubscription: Subscription;
    deleteFeedSubject: Subject<number> = new Subject<number>();
    publicNotificationSubject: Subject<PublicChatMessage> = new Subject<PublicChatMessage>();
    privateSubscription: Subscription;
    privateNotificationSubject: Subject<PrivateChatMessage> = new Subject<PrivateChatMessage>();

    constructor(private authenticationService: AuthenticationService) { }

    connect(): void {
        this.socketJs = new SockJS('http://localhost:9010/socket/connect');
        this.stomp = Stomp.over(this.socketJs);
        this.stomp.debug = null;

        this.stomp.connect({}, (frame) => {
            this._onConnect();

        }, err => {
            console.error(err);
        });
    }

    _onConnect() {
        const uuid = this.authenticationService.getLoggedUserId();

        this.connectionSubscription = this.stomp.subscribe(`/topic/connection`, (data) => {
            const body: ConnectedUser[] = JSON.parse(data.body);;
            this.connectionSubject.next(body);
        });

        this.feedSubscription = this.stomp.subscribe(`/topic/feed`, (feed) => {
            const body: FeedModelDto = JSON.parse(feed.body);
            this.feedSubject.next(body);
        });

        this.deleteFeedSubscription = this.stomp.subscribe(`/topic/delete-feed`, (data) => {
            const body: number = JSON.parse(data.body);
            this.deleteFeedSubject.next(body);
        });

        this.publicSubscription = this.stomp.subscribe(`/topic/public`, (chat) => {
            const body: PublicChatMessage = JSON.parse(chat.body);
            this.publicNotificationSubject.next(body);
        });

        this.privateSubscription = this.stomp.subscribe(`/topic/private.` + uuid, (chat) => {
            const body: PrivateChatMessage = JSON.parse(chat.body);
            this.privateNotificationSubject.next(body);
        })

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
            userUUID: uuid,
        };

        this.stomp.send('/app/logged', {}, JSON.stringify(userConnected));
    }

    _sendWhenDisconnected() {
        const userConnected: ConnectedUser = {
            username: this.authenticationService.getUsername(),
            userUUID: this.authenticationService.getLoggedUserId(),
        };

        this.stomp.send('/app/exit', {}, JSON.stringify(userConnected));
    }

    send(publicMessage: PublicChatMessage): void {
        this.stomp.send('/app/public', {}, JSON.stringify(publicMessage));
    }

    sendPrivate(privateMessage: PrivateChatMessage) {
        this.stomp.send('/app/private', {}, JSON.stringify(privateMessage));
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
        this.privateSubscription.unsubscribe();
        this.feedSubscription.unsubscribe();
        this.deleteFeedSubscription.unsubscribe();
        this.connectionSubscription.unsubscribe();
    }

}