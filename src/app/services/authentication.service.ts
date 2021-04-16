import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { LoginCredentials } from '../model/LoginCredentials';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    JWT_TOKEN = 'jwt-token';
    USER_ROLES = 'user-roles';
    TOKEN_EXPIRATION = 'jwt-expiration';
    USER_DATA = 'user_data';
    USERNAME = 'username';

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: LoginCredentials): Observable<any> {
        const options = { observe: 'response' as const };

        return this.http.post(`http://localhost:9010/app/user/login`, JSON.stringify(credentials), options)
            .pipe(tap(res => {
                this.storeResponseHeaderData(res);
            }));
    }

    private storeResponseHeaderData(res: HttpResponse<any>) {
        sessionStorage.setItem(this.JWT_TOKEN, res.headers.get('jwt-token'));
        sessionStorage.setItem(this.USER_ROLES, res.headers.get('roles'));
        sessionStorage.setItem(this.TOKEN_EXPIRATION, res.headers.get('jwt-expiration'));
        sessionStorage.setItem(this.USER_DATA, res.headers.get('user'));
        sessionStorage.setItem(this.USERNAME, res.headers.get('username'));
    }

    logout(): void {
        sessionStorage.removeItem(this.JWT_TOKEN);
        sessionStorage.removeItem(this.USER_ROLES);
        sessionStorage.removeItem(this.TOKEN_EXPIRATION);
        sessionStorage.removeItem(this.USER_DATA);
        sessionStorage.removeItem(this.USERNAME);
        this.router.navigate(['/']);
    }

    getLoggedUserId(): string {
        return sessionStorage.getItem(this.USER_DATA);
    }

    getJwtToken(): string {
        return sessionStorage.getItem(this.JWT_TOKEN);
    }

    getUsername(): string {
        return sessionStorage.getItem(this.USERNAME);
    }

    isLogged(): boolean {
        const user = sessionStorage.getItem(this.USER_DATA);
        const token = sessionStorage.getItem(this.JWT_TOKEN);
        return user && token ? true : false;
    }

    isTheSameId(id: string): boolean {
        const sessionId = sessionStorage.getItem(this.USER_DATA);
        return id === sessionId;
    }

    logoutUserIfTokenExpired(): void {
        if (!this.isLogged()) return;

        if (this.isTokenExpired()) {
            this.logout();
            console.log('Skończył się czas autoryzacji. Zaloguj się ponownie.')
        }
    }

    private isTokenExpired(): boolean {
        const date = this.getTokenExpirationDate();
        return Number(date) - Number(new Date()) < 0;
    }

    private getTokenExpirationDate(): Date {
        const timestamp = Number(sessionStorage.getItem(this.TOKEN_EXPIRATION));
        return new Date(timestamp);
    }
}