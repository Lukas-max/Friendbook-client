import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AccountService } from 'src/app/services/account.service';
import { Credentials } from 'src/app/model/credentials';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SocketService } from 'src/app/services/socket.Service';

@Component({
  selector: 'app-user-options',
  templateUrl: './user-options.component.html',
  styleUrls: ['./user-options.component.scss']
})
export class UserOptionsComponent implements OnInit {
  message: string;
  isConfirmed: string;
  passwordForm: FormGroup;
  emailForm: FormGroup;
  passwordChangeOption: boolean;
  emailChangeOption: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private socketService: SocketService,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(map(() => window.history.state.confirmed))
      .subscribe((isConfirmed: string) => {
        this.isConfirmed = isConfirmed;
        this.handleComponentExecution();
      }, (err) => {
        this.notAuthenticated();
      });
  }

  handleComponentExecution(): void {
    switch (this.isConfirmed) {
      case 'change-password':
        this.changePassword();
        break;
      case 'change-email':
        this.changeEmail();
        break;
      case 'delete-account':
        this.deleteAccount();
        break;
      default:
        this.notAuthenticated();
    };
  }

  changePassword(): void {
    this.passwordChangeOption = true;
    this.passwordForm = new FormGroup({
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
  }

  submitPasswordChange(): void {
    const credentials: Credentials = {
      password: btoa(this.passwordForm.get('password').value),
      confirmPassword: btoa(this.passwordForm.get('confirmPassword').value)
    };

    this.accountService.changePassword(credentials).subscribe(() => {
      this.message = 'Udało się zmienić hasło.';
    });
  }

  changeEmail(): void {
    this.emailChangeOption = true;
    this.emailForm = new FormGroup({
      email: new FormControl('', { asyncValidators: [this.doesEmailExist.bind(this)], updateOn: 'blur' })
    });
  }

  submitEmailChange(): void {
    const newEmail = this.emailForm.value.email;
    this.accountService.changeEmail(newEmail).subscribe(() => {
      this.authenticationService.logout();
    });
  }

  deleteAccount(): void {
    const confirmation = confirm('Czy na pewno chcesz usunąć swoje konto?');
    confirmation === true ? this.deleteAccountRequest() : this.router.navigateByUrl('/user/starter/main-feed');
  }

  private deleteAccountRequest(): void {
    this.accountService.deleteAccount().subscribe(() => {
      this.socketService._disconnect();
      this.authenticationService.logout();
    });
  }

  notAuthenticated(): void {
    this.authenticationService.logout();
    throw new Error('Odmowa dostępu.');
  }

  private doesEmailExist(control: FormControl): Observable<any> {
    return this.accountService.checkForEmail(control.value)
      .pipe(map(bool => {
        return bool ? { 'mailExists': bool } : null;
      }));
  }

}
