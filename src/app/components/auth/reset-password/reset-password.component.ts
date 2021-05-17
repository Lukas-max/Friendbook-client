import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { ToastService } from 'src/app/utils/toast.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('resetForm') form: NgForm;
  token: string;
  isTokenSend: boolean;
  sendingMail = false;

  constructor(
    private routes: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.token = this.routes.snapshot.queryParams['token'];
    if (this.token)
      this.accountService.sendPasswordResetToken(this.token).subscribe(() => {
        this.isTokenSend = true;
      }, (error: any) => this.toast.onError(error.error.message));
  }

  submit(): void {
    this.sendingMail = true;
    const email: string = this.form.value.email;
    this.accountService.sendPasswordResetRequest(email).subscribe(() => {
      this.router.navigate(['']);
    }, (err: any) => {
      this.toast.onError(err.error.message)
      this.router.navigate(['']);
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
