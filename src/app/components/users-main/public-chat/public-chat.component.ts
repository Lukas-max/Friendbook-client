import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { SocketService } from 'src/app/services/socket.Service';
import { PublicChatMessage } from 'src/app/model/chat/publicChatMessage';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ChatService } from 'src/app/services/chat.service';
import { IntersectionObserverService } from 'src/app/services/intersectionObserver.service';
import { filter, switchMap } from 'rxjs/operators';
import { Chunk } from 'src/app/model/data/chunk';
import { Utils } from 'src/app/utils/utils';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-public-chat',
  templateUrl: './public-chat.component.html',
  styleUrls: ['./public-chat.component.scss']
})
export class PublicChatComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  @ViewChild('observed', { read: ElementRef }) observedElement: ElementRef;
  @ViewChild('scroll', { read: ElementRef }) scrollElement: ElementRef;
  chatMessages: PublicChatMessage[] = [];
  publicSubscription: Subscription;
  message: string;
  componentStart: boolean;
  limit = 10;
  offset = 0;
  isLoading = true;

  constructor(
    private socketService: SocketService,
    private authenticationService: AuthenticationService,
    private chatService: ChatService,
    private intersector: IntersectionObserverService,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.componentStart = true;
    setTimeout(() => this.componentStart = false, 500);
    this.publicSubscription = this.socketService.publicNotificationSubject.subscribe((chat: PublicChatMessage) => {
      this.chatMessages.push(chat);
      this.offset = this.chatMessages.length;
      Utils.scroll(this.scrollElement.nativeElement, 0);
    }, (error: any) => this.toast.onError(error.error.message));
  }

  ngAfterViewInit(): void {
    this.intersector.createAndObserve(this.observedElement).pipe(
      filter((isIntersecting: boolean) => isIntersecting),
      switchMap(() => this.chatService.findPublicMessages(this.limit.toString(), this.offset.toString()))
    ).subscribe((chunk: Chunk<PublicChatMessage>) => {
      chunk.content.forEach((chat: PublicChatMessage) => this.chatMessages.unshift(chat));
      this.offset = this.chatMessages.length;
      this.isLoading = false;
    }, (error: any) => this.toast.onError(error.error.message));
  }

  ngAfterViewChecked(): void {
    if (this.componentStart) {
      Utils.scroll(this.scrollElement.nativeElement, 0);
    }
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

  chatBallonClass(uuid: string): boolean {
    return this.authenticationService.isTheSameId(uuid);
  }

  ngOnDestroy(): void {
    this.publicSubscription.unsubscribe();
  }

}
