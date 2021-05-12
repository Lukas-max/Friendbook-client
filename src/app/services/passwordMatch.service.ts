import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class PasswordMatchValidator {

    matchPasswords(control1: string, control2: string) {
        return (form: FormGroup) => {
            const pass: AbstractControl = form.controls[control1];
            const confirmPass: AbstractControl = form.controls[control2];

            if (pass.errors || confirmPass.errors)
                return null;

            if (pass.value !== confirmPass.value) {
                confirmPass.setErrors({ noMatch: true });
            } else {
                confirmPass.setErrors(null);
            }
        };
    }
}