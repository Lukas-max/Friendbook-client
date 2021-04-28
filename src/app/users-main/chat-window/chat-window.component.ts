import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { SocketService } from 'src/app/services/socket.Service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ChatService } from 'src/app/services/chat.service';
import { Utils } from 'src/app/utils/utils';
import { IntersectionObserverService } from 'src/app/services/intersectionObserver.service';
import { filter, switchMap } from 'rxjs/operators';
import { Chunk } from 'src/app/model/chunk';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('observed', { read: ElementRef }) observedElement: ElementRef;
  @ViewChild('scrollSpan', { read: ElementRef }) scrollElement: ElementRef;
  @ViewChild('overflow', { read: ElementRef }) overflowElement: ElementRef;
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
    private chatService: ChatService,
    private intersector: IntersectionObserverService) { }

  ngOnInit(): void {
    this.initializeSender();
  }

  ngAfterViewInit(): void {
    this.fetchChosenUser();
    this.subscribeToSocket();
  }

  private initializeSender(): void {
    this.senderName = this.authenticationService.getUsername();
    this.senderUUID = this.authenticationService.getLoggedUserId();

    if (!this.senderName || !this.senderUUID) {
      this.authenticationService.logout();
      throw new Error('Brak poprawnej weryfikacji. Wylogowano');
    }
  }

  private fetchChosenUser(): void {
    this.userSelectSubscription = this.userService.chosenUser.subscribe((user: ConnectedUser) => {
      if (this.receiverUUID === user.userUUID) return;

      this.receiverName = user.username;
      this.receiverUUID = user.userUUID;
      this.chatMessages.length = 0;
      this.offset = 0;
      this.isOpen = true;

      this.intersector.createAndObserve(this.observedElement).pipe(
        filter((isIntersecting: boolean) => isIntersecting),
        switchMap(() => this.chatService.findPrivateMessages(this.senderUUID, this.receiverUUID, this.limit.toString(), this.offset.toString()))
      ).subscribe((chunk: Chunk<PrivateChatMessage>) => {
        console.log(chunk);
        chunk.content.forEach((data: PrivateChatMessage) => data.content = Utils.decodeBase64(data.content));
        chunk.content.forEach((chat: PrivateChatMessage) => this.chatMessages.unshift(chat));
        this.offset = this.chatMessages.length;
      }, (err: any) => console.error(err));
    });
  }

  private subscribeToSocket(): void {
    this.privSubscription = this.socketService.privateNotificationSubject.subscribe((chat: PrivateChatMessage) => {
      if (this.receiverUUID === chat.senderUUID) {
        const offsetStart = this.chatMessages.length;
        this.chatMessages.push(chat);
        this.updateOffset(offsetStart)
        this.scroll(1)
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

    const offsetStart = this.chatMessages.length;
    this.socketService.sendPrivate(privateMessage);
    this.chatMessages.push(privateMessage);
    this.message = '';
    this.updateOffset(offsetStart)
    this.scroll(1);
  }

  openClose(): void {
    this.isOpen = !this.isOpen;
    this.notificationAwaiting = false;
  }

  private updateOffset(offsetStart: number) {
    const offsetChange = this.chatMessages.length - offsetStart;
    this.offset += offsetChange;
  }

  private scroll(timeout: number): void {
    const el2: HTMLElement = this.scrollElement.nativeElement;
    setTimeout(() => el2.scrollIntoView(), timeout);
    // setTimeout(() => {
    //   const el: HTMLElement = this.overflowElement.nativeElement;
    //   el.scroll({
    //     top: this.overflowElement.nativeElement.scrollHeight,
    //     left: 0
    //   })
    // }, 200)
  }

  ngOnDestroy(): void {
    this.privSubscription.unsubscribe();
    this.userSelectSubscription.unsubscribe();
  }

}
