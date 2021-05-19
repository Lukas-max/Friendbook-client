import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../model/account/userDto';
import { Credentials } from '../model/account/credentials';
import { MailData } from '../model/mailData';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private http: HttpClient) {
    }

    checkForEmail(typedEmail: string): Observable<boolean> {
        const paramObject = new HttpParams().set('email', typedEmail);
        return this.http.get<boolean>(`${environment.backendUrl}/api/account/email`, { params: paramObject });
    }

    register(userDto: UserDto): Observable<UserDto> {
        return this.http.post<UserDto>(`${environment.backendUrl}/api/account/register`, userDto);
    }

    sendVerificationToken(tokenUUID: string): Observable<any> {
        return this.http.patch(`${environment.backendUrl}/api/account/confirm-account`, tokenUUID)
    }

    sendPasswordResetRequest(email: string): Observable<any> {
        return this.http.get(`${environment.backendUrl}/api/account/reset-request`, { params: { email: email } });
    }

    sendPasswordResetToken(token: string): Observable<any> {
        return this.http.patch(`${environment.backendUrl}/api/account/reset-password`, token);
    }

    changePassword(credentials: Credentials): Observable<any> {
        return this.http.patch(`${environment.backendUrl}/api/account/password`, credentials);
    }

    changeEmail(email: MailData): Observable<any> {
        return this.http.patch(`${environment.backendUrl}/api/account/email`, email);
    }

    deleteAccount() {
        return this.http.delete(`${environment.backendUrl}/api/account`);
    }
}