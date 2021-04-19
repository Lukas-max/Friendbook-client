import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socketService';
import { PublicChatMessage } from 'src/app/model/publicChatMessage';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConnectedUser } from 'src/app/model/connectedUser';

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

  constructor(private socketService: SocketService, private authenticationService: AuthenticationService) { }

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

    this.socketService.send(this.message, username, uuid);
    this.message = '';
  }

  ngOnDestroy(): void {
    this.publicSubscription.unsubscribe();
  }

}
