import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('resetForm') form: NgForm;
  token: string;

  constructor(private routes: ActivatedRoute, private router: Router, private accountService: AccountService) { }

  ngOnInit(): void {
    this.token = this.routes.snapshot.queryParams['token'];
    if (this.token)
      this.accountService.sendPasswordResetToken(this.token).subscribe(() => { });
  }

  submit(): void {
    const email = this.form.value.email;
    this.accountService.sendPasswordResetRequest(email).subscribe(() => {
      this.router.navigate(['']);
    }, (err: any) => {
      console.error(err);
      this.router.navigate(['']);
    });
  }

}
