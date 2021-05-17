import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserResponseDto } from 'src/app/model/userResponseDto';
import { ToastService } from 'src/app/utils/toast.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit {
  users: UserResponseDto[] = [];
  isLoading = true;

  constructor(
    private userService: UserService,
    private authenticationService: AuthenticationService,
    private toast: ToastService) { }

  ngOnInit(): void {
    const uuid = this.authenticationService.getLoggedUserId();
    this.userService.getAllUsers().subscribe(res => {
      this.users = res.filter((user: UserResponseDto) => user.userUUID !== uuid);
      this.isLoading = false;
    }, (error: any) => this.toast.onError(error.error.message));
  }

}
