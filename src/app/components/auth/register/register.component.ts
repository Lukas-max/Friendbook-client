import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { UserDto } from 'src/app/model/userDto';
import { AccountService } from 'src/app/services/account.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Output() closeComponent = new EventEmitter<void>();
  form: FormGroup;
  sendingMail: boolean = false;

  constructor(private formBuilder: FormBuilder, private accountService: AccountService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.form = this.formBuilder.group({
      username: new FormControl(''),
      email: new FormControl('', { asyncValidators: [this.doesEmailExist.bind(this)], updateOn: 'blur' }),
      password: new FormControl(''),
      confirmPassword: new FormControl('')
    });
  }

  onSubmit() {
    this.sendingMail = true;
    const userDto: UserDto = new UserDto(
      this.form.value.username,
      this.form.value.email,
      btoa(this.form.value.password)
    );
    this.accountService.register(userDto).subscribe(data => {
      this.sendingMail = true;
      console.log(data);
    }, err => {
      console.log(err);
    });
    this.form.reset();
    this.onClose();
  }

  onClose() {
    this.closeComponent.emit();
  }

  private doesEmailExist(control: FormControl): Observable<any> {
    return this.accountService.checkForEmail(control.value)
      .pipe(map(bool => {
        return bool ? { 'mailExists': bool } : null;
      }));
  }
}
