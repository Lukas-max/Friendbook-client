import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { SocketService } from 'src/app/services/socket.Service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  chatMessages: PrivateChatMessage[] = [];
  privSubscription: Subscription;
  userSelectSubscription: Subscription;
  isOpen: boolean = false;
  notificationAwaiting: boolean = false;
  message: string;
  senderUUID: string;
  senderName: string;
  receiverUUID: string;
  receiverName: string;

  constructor(
    private userService: UserService,
    private socketService: SocketService,
    private authenticationService: AuthenticationService,
    private chatService: ChatService) { }

  ngOnInit(): void {
    this.initializeChat();
  }

  initializeChat() {
    this.senderName = this.authenticationService.getUsername();
    this.senderUUID = this.authenticationService.getLoggedUserId();

    // --------------------------------------------------------------------------------------------------------------
    this.userSelectSubscription = this.userService.chosenUser.subscribe((user: ConnectedUser) => {
      this.receiverName = user.username;
      this.receiverUUID = user.userUUID;
      this.chatMessages.length = 0;
      this.isOpen = true;

      this.chatService.findMessages(this.senderUUID, this.receiverUUID).subscribe((data: PrivateChatMessage[]) => {
        data.forEach(msg => msg.content = atob(msg.content));
        this.chatMessages = data;
      });
    });

    // --------------------------------------------------------------------------------------------------------------
    this.privSubscription = this.socketService.privateNotificationSubject.subscribe((chat: PrivateChatMessage) => {
      if (this.receiverUUID === chat.senderUUID) {
        this.chatMessages.push(chat);
      }

      if (!this.isOpen && chat.senderUUID === this.receiverUUID) {
        this.notificationAwaiting = true;
      }
    });
  }

  sendMessage() {
    if (!this.message) return;
    if (!this.receiverName || !this.receiverUUID || !this.senderName || !this.senderUUID) return;

    const privateMessage: PrivateChatMessage = {
      senderUUID: this.senderUUID,
      senderName: this.senderName,
      receiverUUID: this.receiverUUID,
      receiverName: this.receiverName,
      content: this.message,
      timestamp: new Date().getTime()
    };

    this.socketService.sendPrivate(privateMessage);
    this.chatMessages.push(privateMessage);
    this.message = '';
  }

  openClose() {
    this.isOpen = !this.isOpen;
    this.notificationAwaiting = false;
  }

  ngOnDestroy(): void {
    this.privSubscription.unsubscribe();
    this.userSelectSubscription.unsubscribe();
  }

}
