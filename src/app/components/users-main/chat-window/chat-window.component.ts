import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { SocketService } from 'src/app/services/socket.Service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ChatService } from 'src/app/services/chat.service';
import { Utils } from 'src/app/utils/utils';
import { Chunk } from 'src/app/model/chunk';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @ViewChild('scrollSpan', { read: ElementRef }) scrollElement: ElementRef;
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
  limit = 10;
  offset = 0;

  constructor(
    private userService: UserService,
    private socketService: SocketService,
    private authenticationService: AuthenticationService,
    private chatService: ChatService) { }

  ngOnInit(): void {
    this.initializeSender();
    this.fetchMessagesAtStart();
    this.subscribeToSocket();
  }

  initializeSender(): void {
    this.senderName = this.authenticationService.getUsername();
    this.senderUUID = this.authenticationService.getLoggedUserId();

    if (!this.senderName || !this.senderUUID) {
      this.authenticationService.logout();
      throw new Error('Brak poprawnej weryfikacji. Wylogowano');
    }
  }

  fetchMessagesAtStart(): void {
    this.userSelectSubscription = this.userService.chosenUser.subscribe((user: ConnectedUser) => {
      if (this.receiverUUID === user.userUUID) return;

      this.receiverName = user.username;
      this.receiverUUID = user.userUUID;
      this.chatMessages.length = 0;
      this.offset = 0;
      this.isOpen = true;

      this.loadMessages(true);
    });
  }

  loadMessages(scrollDown: boolean) {
    this.chatService.findPrivateMessages(this.senderUUID, this.receiverUUID, this.limit.toString(), this.offset.toString())
      .subscribe((chunk: Chunk<PrivateChatMessage>) => {
        chunk.content.forEach((data: PrivateChatMessage) => data.content = Utils.decodeBase64(data.content));
        chunk.content.forEach((chat: PrivateChatMessage) => this.chatMessages.unshift(chat));
        this.offset = this.chatMessages.length;
        if (scrollDown)
          Utils.scroll(this.scrollElement.nativeElement, 0);
      }, (err: any) => console.error(err));
  }

  subscribeToSocket(): void {
    this.privSubscription = this.socketService.privateNotificationSubject.subscribe((chat: PrivateChatMessage) => {
      if (this.receiverUUID === chat.senderUUID) {
        this.chatMessages.push(chat);
        this.offset = this.chatMessages.length;
        Utils.scroll(this.scrollElement.nativeElement, 0);
      }

      if (!this.isOpen && chat.senderUUID === this.receiverUUID) {
        this.notificationAwaiting = true;
      }
    });
  }

  sendMessage(): void {
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
    this.offset = this.chatMessages.length;
    Utils.scroll(this.scrollElement.nativeElement, 0);
  }

  openClose(): void {
    this.isOpen = !this.isOpen;
    this.notificationAwaiting = false;
  }

  ngOnDestroy(): void {
    this.privSubscription.unsubscribe();
    this.userSelectSubscription.unsubscribe();
  }

}
