import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socket.Service';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { UserResponseDto } from 'src/app/model/userResponseDto';

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrls: ['./online-users.component.scss']
})
export class OnlineUsersComponent implements OnInit, OnDestroy {
  connectedUsers: ConnectedUser[];
  users: UserResponseDto[];
  offlineUsers: UserResponseDto[];
  connectionSubscription: Subscription;
  privateSubscription: Subscription;
  chosenUserUUID: string;

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.getConnectedUsers();
    this.getNotificationConnection();
    this.getUsers();
  }

  getConnectedUsers() {
    this.connectionSubscription = this.socketService.connectionSubject.subscribe((connected: ConnectedUser[]) => {
      this.connectedUsers = connected;
      this.populateOfflineUsers();
    });
  }

  getNotificationConnection() {
    this.privateSubscription = this.socketService.privateNotificationSubject.subscribe((notification: PrivateChatMessage) => {
      if (notification.senderUUID === this.chosenUserUUID) return;

      const user = this.connectedUsers.find(connectedUser => connectedUser.userUUID === notification.senderUUID);
      user.messagePending = true;
    });
  }

  getUsers() {
    this.userService.getAllUsers().subscribe((users: UserResponseDto[]) => {
      this.users = users;
    });
  }

  populateOfflineUsers() {
    if (!this.connectedUsers || !this.users) {
      setTimeout(() => this.populateOfflineUsers(), 500)
    } else {
      this.offlineUsers = this.users.slice();
      this.connectedUsers.forEach((user: ConnectedUser) => {
        this.removeOnlineUser(user);
      });
    }
  }

  removeOnlineUser(connectedUser: ConnectedUser) {
    const index = this.offlineUsers.findIndex((usr) => usr.userUUID === connectedUser.userUUID);

    this.offlineUsers.splice(index, 1);
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