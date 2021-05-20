import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SocketService } from 'src/app/services/socket.Service';

@Component({
  selector: 'app-users-main',
  templateUrl: './users-main.component.html',
  styleUrls: ['./users-main.component.scss']
})
export class UsersMainComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService, private socketService: SocketService) { }

  ngOnInit(): void {
  }

  logout(): void {
    if (confirm('Chcesz się wylogować?')) {
      this.socketService._disconnect();
      this.authenticationService.logout();
    }
  }
}
