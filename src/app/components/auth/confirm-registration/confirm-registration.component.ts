import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.component.html',
  styleUrls: ['./confirm-registration.component.scss']
})
export class ConfirmRegistrationComponent implements OnInit {
  response: boolean = false;
  error: boolean = false;
  message: string;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.sendToken();
  }

  sendToken() {
    const token = this.route.snapshot.queryParams['token'];
    this.accountService.sendVerificationToken(token).subscribe(() => {
      this.response = true;
    }, err => {
      this.toast.onError(err.error.message)
      this.message = err.error.message;
    })
  }
}
