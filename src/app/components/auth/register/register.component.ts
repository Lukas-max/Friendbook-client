import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UserDto } from 'src/app/model/account/userDto';
import { AccountService } from 'src/app/services/account.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PasswordMatchValidator } from 'src/app/services/passwordMatch.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Output() closeComponent = new EventEmitter<void>();
  form: FormGroup;
  sendingMail: boolean = false;
  mailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  checkboxFlag: boolean;
  content: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private passwordMatchValidator: PasswordMatchValidator,
    private toast: ToastService) { }

  ngOnInit(): void {
    this.createListener();
    this.initForm();
  }

  createListener(): void {
    window.addEventListener('keydown', (event: any) => {
      if (event.code === 'Escape') {
        this.closeComponent.emit();
      }
    });
  }

  initForm(): void {
    this.form = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(60)]),
      email: new FormControl('', {
        validators: [Validators.required, Validators.pattern(this.mailPattern)],
        asyncValidators: [this.doesEmailExist.bind(this)], updateOn: 'blur'
      }),
      password: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(60)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(5)])
    }, { validator: this.passwordMatchValidator.matchPasswords('password', 'confirmPassword') });
  }

  confirmContent(): void {
    if (this.checkboxFlag) {
      this.content = true;
    }
  }

  onSubmit(): void {
    const userDto = this._createUserDto();
    this._sendForm(userDto);
  }

  _createUserDto(): UserDto {
    this.sendingMail = true;
    return new UserDto(
      this.form.value.username,
      this.form.value.email,
      btoa(this.form.value.password)
    );
  }

  _sendForm(userDto: UserDto): void {
    this.accountService.register(userDto).subscribe(() => {
      this.form.reset();
      this.onClose();
    }, (error: any) => {
      this.toast.onError(error.error.message);
    });
  }

  onClose(): void {
    this.closeComponent.emit();
  }

  private doesEmailExist(control: FormControl): Observable<any> {
    return this.accountService.checkForEmail(control.value)
      .pipe(map(bool => {
        return bool ? { 'mailExists': bool } : null;
      }));
  }

  get username(): AbstractControl {
    return this.form.get('username');
  }

  get email(): AbstractControl {
    return this.form.get('email');
  }

  get password(): AbstractControl {
    return this.form.get('password');
  }

  get confirm(): AbstractControl {
    return this.form.get('confirmPassword')
  }
}
