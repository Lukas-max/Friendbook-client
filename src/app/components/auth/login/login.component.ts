import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NgForm } from '@angular/forms';
import { LoginCredentials } from 'src/app/model/LoginCredentials';
import { SocketService } from 'src/app/services/socket.Service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild("loginForm") form: NgForm;
  starterLoginPage: boolean;
  error: boolean;
  pathVariable: string;
  isLoading = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private socketService: SocketService,
    private routes: ActivatedRoute) { }

  ngOnInit(): void {
    this.pathVariable = this.routes.snapshot.params['value'];
    this.starterLoginPage = this.pathVariable ? false : true;
  }

  onSubmit(): void {
    this.isLoading = true;
    const credentials = new LoginCredentials(
      this.form.value.email,
      btoa(this.form.value.password)
    );

    this.authenticationService.login(credentials).subscribe(() => {
      this.handelLoginExecution();
    }, () => {
      this.isLoading = false;
      this.error = true;
    });
  }

  handelLoginExecution(): void {
    switch (this.pathVariable) {
      case 'change-password':
        this.optionUserChange('change-password');
        break;
      case 'change-email':
        this.optionUserChange('change-email');
        break;
      case 'delete-account':
        this.optionUserChange('delete-account');
        break;
      default:
        this.normalLogin();
    }
  }

  optionUserChange(option: string): void {
    this.router.navigate(['/user/starter/change'], { state: { confirmed: option } });
  }

  normalLogin(): void {
    if (this.authenticationService.isLogged() && !this.socketService.isConnected()) {
      this.socketService.connect();
    };
    this.router.navigate(['/user', 'starter', 'main-feed']);
  }

  logout(): void {
    this.socketService._disconnect();
    this.authenticationService.logout();
  }

  isLogged(): boolean {
    return this.authenticationService.isLogged();
  }

}
