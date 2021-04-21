import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socket.Service';
import { PublicChatMessage } from 'src/app/model/publicChatMessage';
import { Subscription, Subject } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-public-chat',
  templateUrl: './public-chat.component.html',
  styleUrls: ['./public-chat.component.scss']
})
export class PublicChatComponent implements OnInit, OnDestroy {
  chatMessages: PublicChatMessage[] = [];
  publicSubscription: Subscription;
  message: string;


  constructor(private socketService: SocketService,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.publicSubscription = this.socketService.publicNotificationSubject.subscribe((chat: PublicChatMessage) => {
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

  ngOnDestroy(): void {
    this.publicSubscription.unsubscribe();
  }

}
