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
    }

    logout() {
        sessionStorage.removeItem(this.JWT_TOKEN);
        sessionStorage.removeItem(this.USER_ROLES);
        sessionStorage.removeItem(this.TOKEN_EXPIRATION);
        sessionStorage.removeItem(this.USER_DATA);
        this.router.navigate(['/']);
    }

    getLoggedUser() {
        return sessionStorage.getItem(this.USER_DATA);
    }

    getJwtToken() {
        return sessionStorage.getItem(this.JWT_TOKEN);
    }

    isLogged() {
        const user = sessionStorage.getItem(this.USER_DATA);
        return user !== null;
    }

    logoutUserIfTokenExpired() {
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