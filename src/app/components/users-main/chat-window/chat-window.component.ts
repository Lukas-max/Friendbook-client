import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { PrivateChatMessage } from 'src/app/model/privateChatMessage';
import { UserService } from 'src/app/services/user.service';
import { SocketService } from 'src/app/services/socket.Service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ChatService } from 'src/app/services/chat.service';
import { Utils } from 'src/app/utils/utils';
import { Chunk } from 'src/app/model/chunk';
import { UserData } from 'src/app/model/userData';

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
  loadedAllMessages: boolean = false;
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

  /**
   * Gets the username and userUUID from browser localStorage and checks if it's ok. If undefined -> commit full logout to starter page and throw error.
   */
  initializeSender(): void {
    this.senderName = this.authenticationService.getUsername();
    this.senderUUID = this.authenticationService.getLoggedUserId();

    if (!this.senderName || !this.senderUUID) {
      this.authenticationService.logout();
      throw new Error('Brak poprawnej weryfikacji. Wylogowano');
    }
  }

  /**
   * (This method gets called every time we click a different user to chat)
   * 
   * This subscribes at startup to chosenUser Subject. So this method will get invoked each time we clicked a user on OnlineUserComponent. 
   * On user click we pick this user data. If the picked user userUUID is the same as receiverUUID we - open the chat window and return the method,
   *  cause we clicked the same user.
   * But if the userUUID is an other user we:
   * 1) set receiverName and UUID to have that user data stored in a variable
   * 2) we restart the chat window variables (this happens each time we pick a user to chat)
   * - loadedAllMessages = false -> That will make the message download button visible
   * - isOpen = true will display the chat window
   * 3) we invoke the loadMessages(true) to load the first messages of the p2p chat
   */
  fetchMessagesAtStart(): void {
    this.userSelectSubscription = this.userService.chosenUser.subscribe((user: UserData) => {
      if (this.receiverUUID === user.userUUID) {
        this.isOpen = !this.isOpen;
        return;
      }

      this.receiverName = user.username;
      this.receiverUUID = user.userUUID;
      this.loadedAllMessages = false;
      this.chatMessages.length = 0;
      this.offset = 0;
      this.isOpen = true;

      this.loadMessages(true);
    });
  }

  /**
   * 
   * This method loads the message from the private chat room of sender user and reveiver user. 
   * (It happens during coversation init or by pressing the download message button)
   * After download we decode the text message content and then add it to the chatMessage array to display those messages.
   * Then we set the new offset.
   * After that 
   * - If content length is 0, or lower then  variable this.limit that means ther are on more messages left. 
   * So we se loadedMessages to true. That will hide the download messages button.
   * - If parameter scrollDown is true: (thats always at each user chat init and thats the first download of messages)
   * we use Utils.scroll to scroll to bottom of messages.
   * It't false when we click the download button on the top, so it wont scroll down bottom.
   */
  loadMessages(scrollDown: boolean) {
    this.chatService.findPrivateMessages(this.senderUUID, this.receiverUUID, this.limit.toString(), this.offset.toString())
      .subscribe((chunk: Chunk<PrivateChatMessage>) => {
        chunk.content.forEach((data: PrivateChatMessage) => data.content = Utils.decodeBase64(data.content));
        chunk.content.forEach((chat: PrivateChatMessage) => this.chatMessages.unshift(chat));
        this.offset = this.chatMessages.length;
        if (chunk.content.length === 0 || chunk.content.length < this.limit)
          this.loadedAllMessages = true;
        if (scrollDown)
          Utils.scroll(this.scrollElement.nativeElement, 0);
      }, (err: any) => console.error(err));
  }

  /**
   * We subscribe to privateNotificationSubject. It passes us the message send by the user.
   * First if statement:
   *  - if the message is passed by the user we are in conversation we push his message to chatMessages array. We set the offset 
   * and scroll to bottom, to point at the new message.
   * 
   * Second if statement:
   * - if the message is send by the user we are in conversation but our tab is minimalized we set notificationAwaiting to true.
   * This will view a notification on the tab to inform the user that a message has come.
   */
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

  /**
   * Here we send our message to the user.
   * We check if the message isnt null. And If our and the other user data variables are set, not empty.
   * 
   * Then we build the PrivateChatMessage and we use socketService to send it to the message broker.
   * After that we push our message to the messageArray to view it and reset the input tab. We set the new offset and scroll the window to bottom
   * to view our message. 
   */
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

  /**
   * Here we change the value isOpen on each click of the ChatMessage tab. This will open or close the chat window.
   * If there is a notification that user sent a message we erase it by setting notificationAwaiting to false;
   */
  openClose(): void {
    this.isOpen = !this.isOpen;
    this.notificationAwaiting = false;
  }

  /**
   * Realesing the memory:
   */
  ngOnDestroy(): void {
    this.privSubscription.unsubscribe();
    this.userSelectSubscription.unsubscribe();
  }

}
