import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../model/userDto';
import { Credentials } from '../model/credentials';


@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private http: HttpClient) {
    }

    checkForEmail(typedEmail: string): Observable<boolean> {
        const paramObject = new HttpParams().set('email', typedEmail);
        return this.http.get<boolean>(`http://localhost:9010/api/account/email`, { params: paramObject });
    }

    register(userDto: UserDto): Observable<UserDto> {
        return this.http.post<UserDto>(`http://localhost:9010/api/account/register`, userDto);
    }

    sendVerificationToken(tokenUUID: string): Observable<any> {
        return this.http.post(`http://localhost:9010/api/account/confirm-account`, tokenUUID)
    }

    sendPasswordResetRequest(email: string): Observable<any> {
        return this.http.get(`http://localhost:9010/api/account/reset-request`, { params: { email: email } });
    }

    sendPasswordResetToken(token: string): Observable<any> {
        return this.http.patch(`http://localhost:9010/api/account/reset-password`, token);
    }

    changePassword(credentials: Credentials): Observable<any> {
        return this.http.patch(`http://localhost:9010/api/account/password`, credentials);
    }

    changeEmail(email: string): Observable<any> {
        return this.http.patch(`http://localhost:9010/api/account/email`, email);
    }

    deleteAccount() {
        return this.http.delete(`http://localhost:9010/api/account`);
    }
}