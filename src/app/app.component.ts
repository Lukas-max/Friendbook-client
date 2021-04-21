import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { SocketService } from './services/socket.Service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'FriendBook';

  constructor(private authenticationService: AuthenticationService, private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.authenticationService.logoutUserIfTokenExpired();
    this.socketConnect();
  }

  socketConnect() {
    if (this.authenticationService.isLogged() && !this.socketService.isConnected())
      this.socketService.connect();
  }

}
