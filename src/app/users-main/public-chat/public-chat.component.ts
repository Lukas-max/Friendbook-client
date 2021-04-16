import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socketService';
import { ChatModel } from 'src/app/model/chatModel';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-public-chat',
  templateUrl: './public-chat.component.html',
  styleUrls: ['./public-chat.component.scss']
})
export class PublicChatComponent implements OnInit, OnDestroy {
  chatMessages: ChatModel[] = [];
  publicSubscription: Subscription;
  message: string;

  constructor(private socketService: SocketService, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.publicSubscription = this.socketService.publicSubject.subscribe((chat: ChatModel) => {
      this.chatMessages.push(chat);
    });
  }

  sendMessage(): void {
    if (!this.message) return;

    const username = this.authenticationService.getUsername();
    if (!username) return;

    this.socketService.send(this.message, username);
    this.message = '';
  }

  ngOnDestroy(): void {
    this.publicSubscription.unsubscribe();
  }

}
