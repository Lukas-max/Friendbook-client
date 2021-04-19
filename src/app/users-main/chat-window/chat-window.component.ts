import { Component, OnInit, OnDestroy } from '@angular/core';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { ActivatedRoute, Params } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { ConnectedUser } from 'src/app/model/connectedUser';
import { SocketService } from 'src/app/services/socketService';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';

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
  message: string;
  receiverUUID: string;
  receiverName: string;

  constructor(private userService: UserService, private socketService: SocketService, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.userSelectSubscription = this.userService.chosenUser.subscribe((user: ConnectedUser) => {
      this.receiverName = user.username;
      this.receiverUUID = user.userUUID;
      this.chatMessages.length = 0;
      this.isOpen = true;
    });

    this.privSubscription = this.socketService.privateSubject.subscribe((chat: PrivateChatMessage) => {
      if (this.receiverUUID !== chat.senderUUID)
        this.chatMessages.length = 0;

      this.receiverName = chat.senderName
      this.receiverUUID = chat.senderUUID;
      this.chatMessages.push(chat);
      this.isOpen = true;
    });
  }

  sendMessage() {
    const username = this.authenticationService.getUsername();
    const uuid = this.authenticationService.getLoggedUserId();
    if (!username || !uuid) return;

    const privateMessage: PrivateChatMessage = {
      senderUUID: uuid,
      senderName: username,
      receiverUUID: this.receiverUUID,
      receiverName: this.receiverName,
      content: this.message,
      timestamp: new Date().getTime()
    };

    console.log(privateMessage);
    this.socketService.sendPrivate(privateMessage);
    this.chatMessages.push(privateMessage);
    this.message = '';
  }

  openClose() {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(): void {
    this.privSubscription.unsubscribe();
    this.userSelectSubscription.unsubscribe();
  }

}
