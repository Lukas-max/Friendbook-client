import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { LoginCredentials } from '../model/account/LoginCredentials';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    JWT_TOKEN = 'friendplace-jwt-token';
    USER_ROLES = 'friendplace-user-roles';
    TOKEN_EXPIRATION = 'friendplace-jwt-expiration';
    USER_DATA = 'friendplace-user_data';
    USERNAME = 'friendplace-username';

    constructor(private http: HttpClient, private router: Router) { }

    login(credentials: LoginCredentials): Observable<any> {
        const options = { observe: 'response' as const };

        return this.http.post(`${environment.backendUrl}/app/user/login`, JSON.stringify(credentials), options)
            .pipe(tap(res => {
                this.storeResponseHeaderData(res);
            }));
    }

    private storeResponseHeaderData(res: HttpResponse<any>) {
        localStorage.setItem(this.JWT_TOKEN, res.headers.get('jwt-token'));
        localStorage.setItem(this.USER_ROLES, res.headers.get('roles'));
        localStorage.setItem(this.TOKEN_EXPIRATION, res.headers.get('jwt-expiration'));
        localStorage.setItem(this.USER_DATA, res.body.userUUID);
        localStorage.setItem(this.USERNAME, res.body.username);
    }

    logout(): void {
        localStorage.removeItem(this.JWT_TOKEN);
        localStorage.removeItem(this.USER_ROLES);
        localStorage.removeItem(this.TOKEN_EXPIRATION);
        localStorage.removeItem(this.USER_DATA);
        localStorage.removeItem(this.USERNAME);
        this.router.navigate(['/']);
    }

    getLoggedUserId(): string {
        return localStorage.getItem(this.USER_DATA);
    }

    getJwtToken(): string {
        return localStorage.getItem(this.JWT_TOKEN);
    }

    getUsername(): string {
        return localStorage.getItem(this.USERNAME);
    }

    isLogged(): boolean {
        const user = localStorage.getItem(this.USER_DATA);
        const token = localStorage.getItem(this.JWT_TOKEN);
        return user && token ? true : false;
    }

    isTheSameId(id: string): boolean {
        const sessionId = localStorage.getItem(this.USER_DATA);
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
        const timestamp = Number(localStorage.getItem(this.TOKEN_EXPIRATION));
        return new Date(timestamp);
    }
}