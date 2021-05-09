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
  error: boolean;

  constructor(
    private router: Router,

    private authenticationService: AuthenticationService,
    private socketService: SocketService,
    private routes: ActivatedRoute) { }

  ngOnInit(): void {
    const param = this.routes.snapshot.params['value'];
  }

  onSubmit() {
    const credentials = new LoginCredentials(
      this.form.value.email,
      btoa(this.form.value.password)
    );

    this.authenticationService.login(credentials).subscribe((res) => {
      if (this.authenticationService.isLogged() && !this.socketService.isConnected())
        this.socketService.connect();
      this.router.navigate(['/user', 'starter', 'main-feed']);
    }, error => {
      console.log(error);
      this.error = true;
    });
  }

  logout() {
    this.socketService._disconnect();
    this.authenticationService.logout();
  }

  isLogged() {
    return this.authenticationService.isLogged();
  }
}
