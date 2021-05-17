import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socket.Service';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { UserResponseDto } from 'src/app/model/userResponseDto';
import { ChatService } from 'src/app/services/chat.service';
import { UserData } from 'src/app/model/userData';
import { ToastService } from 'src/app/utils/toast.service';

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrls: ['./online-users.component.scss']
})
export class OnlineUsersComponent implements OnInit, OnDestroy {
  connectedUsers: UserData[];
  users: UserResponseDto[];
  offlineUsers: UserResponseDto[];
  pendingMessages: UserData[];
  pendingMessegesFromLogoutUsers = new Set();
  connectionSubscription: Subscription;
  privateSubscription: Subscription;
  deletedAccountSubscription: Subscription;
  chosenUserUUID: string;

  constructor(
    private socketService: SocketService,
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private chatService: ChatService,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.getConnectedUsers();
    this.getUsers();
    this.getPending();
    this.getNotificationConnection();
    this.getDeletedAccount();
  }

  /**
   * This method is called each time a user logs in or logs out!
   * Here we get UserData of connected by stomp and online users from BehaviourSubject in SocketService. We delete the offlineUsers array to repopulate them in a minute.
   * When we got that we evoke populateOfflineUsers();
   */
  getConnectedUsers(): void {
    this.connectionSubscription = this.socketService.connectionSubject.subscribe((connected: UserData[]) => {
      this.offlineUsers = undefined;
      this.connectedUsers = connected;
      this.populateOfflineUsers();
      this.setPendingMessages();
    });
  }

  /**
   * Here we fetch every message send by an other user on the private user stomp channel subscription. But only for that to set the messagePending field of that user to true.
   * That will change the view. If we chat with the an other user and a message comes from him we return; the method.
   */
  getNotificationConnection(): void {
    this.privateSubscription = this.socketService.privateNotificationSubject.subscribe((notification: PrivateChatMessage) => {
      if (notification.senderUUID === this.chosenUserUUID) return;

      const user = this.connectedUsers.find(connectedUser => connectedUser.userUUID === notification.senderUUID);
      user.messagePending = true;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  /**
   * We get the UserData of all users registered on the server.
   */
  getUsers(): void {
    this.userService.getAllUsers().subscribe((users: UserResponseDto[]) => {
      this.users = users;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  /**
   * We set the offlineUsers array with all the registered users then we remove from that array all the connectedUsers.
   */
  populateOfflineUsers(): void {
    if (!this.connectedUsers || !this.users) {
      setTimeout(() => this.populateOfflineUsers(), 100)
    } else {
      this.offlineUsers = this.users.slice();
      this.connectedUsers.forEach((user: ConnectedUser) => {
        this.removeOnlineUser(user);
      });
    }
  }

  removeOnlineUser(connectedUser: ConnectedUser): void {
    const index = this.offlineUsers.findIndex((usr) => usr.userUUID === connectedUser.userUUID);

    this.offlineUsers.splice(index, 1);
  }


  /**
   * Subscribes to websocket subject. Then when a user deletes his account we get by STOMP his data in a UserResponseDto. After that we delete this user from the
   * users array, so the he wont repopulate the offlineUsers array. And we remove him from connectedUsers array so he will be erased from Online users view.
   */
  getDeletedAccount(): void {
    this.deletedAccountSubscription = this.socketService.deletedAccountSubject.subscribe((userResponse: UserResponseDto) => {
      let index = this.users.findIndex((user) => user.userUUID === userResponse.userUUID);
      this.users.splice(index, 1);

      index = this.connectedUsers.findIndex((user: ConnectedUser) => user.userUUID === userResponse.userUUID);
      this.connectedUsers.splice(index, 1);
    }, (error: any) => this.toast.onError(error.error.message));
  }

  /**
   * Will check if there are pending messages from other users.
   * It calls setPendingMessages(pendingMessageUser: UserData[]).
   */
  getPending(): void {
    this.chatService.getUserData().subscribe((data: UserData[]) => {
      this.pendingMessages = data;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  /**
   * 
   * We use here - this.pending: UserData[].  To get the array of user with pending messages.
   * 
   * First this method checks if the connectedUsers and offlineUsers are ready, if not it waits. 
   * Then for each of the pending (user with message or messages not read) we iterate and check the connectedUsers array and if not found the offlineUsers array 
   * to find the searched user. Then when found we stamp him by setting messagePending field to true. So the view will change accordingly.
   */
  setPendingMessages(): void {
    if (!this.pendingMessages || !this.offlineUsers || !this.connectedUsers) {
      setTimeout(() => this.setPendingMessages(), 150);
    } else {
      this.pendingMessages.forEach((user: UserData) => {
        let userWithMessagePending: any = this.connectedUsers.find((connectedUser: UserData) => connectedUser.userUUID === user.userUUID);

        if (userWithMessagePending)
          userWithMessagePending.messagePending = true;
        else {
          userWithMessagePending = this.offlineUsers.find((offlineUser: UserResponseDto) => offlineUser.userUUID === user.userUUID);
          userWithMessagePending.messagePending = true;
        }
      });
    }
  }


  /**
   * 
   * @param connectedUser - It's the user we have clicked to open chat window with him. 
   * 
   * When clicked on a connectedUser or offline user we evoke this method. First we chek by the userUUID if the user havent clicked himself. If no, we use userService 
   * Subject to pass the user .next(). That will open the chat window. If we had a notification of a PENDING message from the clicked user
   * we erase it by setting messagePending to false.
   * We also set chosenUserUUID to this user. So in .getNotificationConnection(): void we can check when a message comes to this active chosen user and we wont set his
   * messagePending to true. Thats why we will not have PENDING status message while chatting with the active user.
   */
  openChat(connectedUser: UserData): void {
    if (connectedUser.userUUID === this.authenticationService.getLoggedUserId()) return;

    this.resetPending(connectedUser);
    this.chosenUserUUID = connectedUser.userUUID;
    this.userService.chosenUser.next(connectedUser);
  }

  /**
   * 
   * @param connectedUser - user passed from the method:  openChat(connectedUser: UserData): void
   * 
   * It will set messagePending to false and/or remove the pending status from pending array.
   */
  resetPending(connectedUser: UserData): void {
    connectedUser.messagePending = false;
    const index = this.pendingMessages.findIndex((user: UserData) => user.userUUID === connectedUser.userUUID);
    this.pendingMessages.splice(index, 1);
  }

  /**
   * Unsubscribing.
   */
  ngOnDestroy(): void {
    this.connectionSubscription.unsubscribe();
    this.privateSubscription.unsubscribe();
    this.deletedAccountSubscription.unsubscribe();
  }
}
