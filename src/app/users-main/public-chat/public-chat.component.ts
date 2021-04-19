import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socketService';
import { PublicChatMessage } from 'src/app/model/publicChatMessage';
import { Subscription, Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-public-chat',
  templateUrl: './public-chat.component.html',
  styleUrls: ['./public-chat.component.scss']
})
export class PublicChatComponent implements OnInit, OnDestroy {
  chatMessages: PublicChatMessage[] = [];
  publicSubscription: Subscription;
  connectionSubscription: Subscription;
  message: string;
  connectedUsers: ConnectedUser[];
  chosenUser: Subject<ConnectedUser> = new Subject<ConnectedUser>();


  constructor(private socketService: SocketService,
    private authenticationService: AuthenticationService,
    private userSevice: UserService) { }

  ngOnInit(): void {
    this.connectionSubscription = this.socketService.connectionSubject.subscribe((connected: ConnectedUser[]) => {
      this.connectedUsers = connected;
    });

    this.publicSubscription = this.socketService.publicSubject.subscribe((chat: PublicChatMessage) => {
      this.chatMessages.push(chat);
    });
  }

  sendMessage(): void {
    if (!this.message) return;

    const username = this.authenticationService.getUsername();
    const uuid = this.authenticationService.getLoggedUserId();
    if (!username || !uuid) return;

    const publicMessage: PublicChatMessage = {
      content: this.message,
      username: username,
      userUUID: uuid,
      timestamp: new Date().getTime()
    }

    this.socketService.send(publicMessage);
    this.message = '';
  }

  openChat(connectedUser: ConnectedUser) {
    if (connectedUser.userUUID === this.authenticationService.getLoggedUserId()) return;

    this.userSevice.chosenUser.next(connectedUser);
  }

  ngOnDestroy(): void {
    this.publicSubscription.unsubscribe();
    this.connectionSubscription.unsubscribe();
  }

}
