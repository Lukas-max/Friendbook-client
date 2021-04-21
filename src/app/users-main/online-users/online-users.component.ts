import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socket.Service';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrls: ['./online-users.component.scss']
})
export class OnlineUsersComponent implements OnInit, OnDestroy {
  connectedUsers: ConnectedUser[];
  connectionSubscription: Subscription;
  privateSubscription: Subscription;
  chosenUserUUID: string;

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.connectionSubscription = this.socketService.connectionSubject.subscribe((connected: ConnectedUser[]) => {
      this.connectedUsers = connected;
    });

    this.privateSubscription = this.socketService.privateNotificationSubject.subscribe((notification: PrivateChatMessage) => {
      if (notification.senderUUID === this.chosenUserUUID) return;

      const user = this.connectedUsers.find(connectedUser => connectedUser.userUUID === notification.senderUUID);
      user.messagePending = true;
    });
  }

  openChat(connectedUser: ConnectedUser): void {
    if (connectedUser.userUUID === this.authenticationService.getLoggedUserId()) return;

    this.chosenUserUUID = connectedUser.userUUID;
    connectedUser.messagePending = false;
    this.userService.chosenUser.next(connectedUser);
  }

  ngOnDestroy(): void {
    this.connectionSubscription.unsubscribe();
    this.privateSubscription.unsubscribe();
  }
}
