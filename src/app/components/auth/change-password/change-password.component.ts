import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Credentials } from 'src/app/model/credentials';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  message: string;
  isConfirmed: string;
  passwordForm: FormGroup;
  passwordChangeOption: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private accountService: AccountService) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(map(() => window.history.state.confirmed))
      .subscribe((isConfirmed: string) => {
        this.isConfirmed = isConfirmed;

        switch (this.isConfirmed) {
          case 'change-password':
            this.changePassword();
            break;
          default:
            this.notAuthenticated();
        }
      }, (err) => {
        this.notAuthenticated();
      });
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

  notAuthenticated(): void {
    this.authenticationService.logout();
    throw new Error('Odmowa dostępu.');
  }
}
