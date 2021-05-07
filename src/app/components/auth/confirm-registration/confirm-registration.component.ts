import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-confirm-registration',
  templateUrl: './confirm-registration.component.html',
  styleUrls: ['./confirm-registration.component.scss']
})
export class ConfirmRegistrationComponent implements OnInit {
  response: boolean = false;
  error: boolean = false;
  message: string;

  constructor(private route: ActivatedRoute, private accountService: AccountService) { }

  ngOnInit(): void {
    this.sendToken();
  }

  sendToken() {
    const token = this.route.snapshot.queryParams['token'];
    this.accountService.sendVerificationToken(token).subscribe(() => {
      this.response = true;
    }, err => {
      this.error = true;
      this.message = err.error.message;
    })
  }
}
