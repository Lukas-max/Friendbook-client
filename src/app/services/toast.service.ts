import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private toast: ToastrService) { }

    inform(message: string): void {
        this.toast.success('Info', message, {
            closeButton: true,
            disableTimeOut: true
        });
    }

    onError(message: string): void {
        this.toast.error('Error', message, {
            closeButton: true,
            disableTimeOut: true
        });
    }
}