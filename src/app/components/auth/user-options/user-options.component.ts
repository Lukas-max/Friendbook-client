import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AccountService } from 'src/app/services/account.service';
import { Credentials } from 'src/app/model/credentials';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SocketService } from 'src/app/services/socket.Service';
import { MailData } from 'src/app/model/mailData';
import { PasswordMatchValidator } from 'src/app/services/passwordMatch.service';
import { ToastService } from 'src/app/utils/toast.service';

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
  mailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private socketService: SocketService,
    private accountService: AccountService,
    private passwordMatchValidator: PasswordMatchValidator,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(map(() => window.history.state.confirmed))
      .subscribe((isConfirmed: string) => {
        this.isConfirmed = isConfirmed;
        this.handleComponentExecution();
      }, (error: any) => this.toast.onError(error.error.message));
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
      password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(5)])
    }, { validators: [this.passwordMatchValidator.matchPasswords('password', 'confirmPassword')] });
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
      email: new FormControl('', {
        validators: [Validators.required, Validators.pattern(this.mailPattern)],
        asyncValidators: [this.doesEmailExist.bind(this)], updateOn: 'blur'
      })
    });
  }

  submitEmailChange(): void {
    const newEmail = this.emailForm.value.email;
    const mailData: MailData = { email: newEmail };
    this.accountService.changeEmail(mailData).subscribe(() => {
      this.authenticationService.logout();
    }, (error: any) => this.toast.onError(error.error.message));
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
    this.toast.onError('Odmowa dostępu')
  }

  private doesEmailExist(control: FormControl): Observable<any> {
    return this.accountService.checkForEmail(control.value)
      .pipe(map(bool => {
        return bool ? { 'mailExists': bool } : null;
      }));
  }

  get password(): AbstractControl {
    return this.passwordForm.get('password');
  }

  get confirm(): AbstractControl {
    return this.passwordForm.get('confirmPassword');
  }

  get email(): AbstractControl {
    return this.emailForm.get('email');
  }
}
