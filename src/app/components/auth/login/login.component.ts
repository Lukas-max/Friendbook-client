import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NgForm } from '@angular/forms';
import { LoginCredentials } from 'src/app/model/LoginCredentials';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild("loginForm") form: NgForm;

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const credentials = new LoginCredentials(
      this.form.value.email,
      this.form.value.password);

    this.authenticationService.login(credentials).subscribe((res) => {
      this.router.navigate(['/user', 'starter', 'main-feed']);
    }, error => {
      console.log(error);
    });
  }

  logout() {
    this.authenticationService.logout();
  }

  isLogged() {
    return this.authenticationService.isLogged();
  }
}
