import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserDto, IUserDto } from '../model/userDto';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(private http: HttpClient) {
    }

    checkForEmail(typedEmail: string): Observable<boolean> {
        return this.http.get<boolean>(`http://localhost:9010/api/account/email`, { params: new HttpParams().set('email', typedEmail) });
    }

    register(userDto: UserDto): Observable<IUserDto> {
        return this.http.post<IUserDto>(`http://localhost:9010/api/account/register`, userDto);
    }

    sendVerificationToken(tokenUUID: string): Observable<any> {
        return this.http.post(`http://localhost:9010/api/account/confirm-account`, tokenUUID)
    }
}