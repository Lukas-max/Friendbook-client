import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { SocketService } from '../services/socketService';

@Component({
  selector: 'app-users-main',
  templateUrl: './users-main.component.html',
  styleUrls: ['./users-main.component.scss']
})
export class UsersMainComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService, private socketService: SocketService) { }

  ngOnInit(): void {
  }

  logout() {
    this.socketService._disconnect();
    this.authenticationService.logout();
  }
}
