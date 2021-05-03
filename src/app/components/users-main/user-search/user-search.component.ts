import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserResponseDto } from 'src/app/model/userResponseDto';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit {
  users: UserResponseDto[] = [];

  constructor(private userService: UserService, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    const uuid = this.authenticationService.getLoggedUserId();
    this.userService.getAllUsers().subscribe(res => {
      this.users = res.filter((user: UserResponseDto) => user.userUUID !== uuid);
    });
  }

}
