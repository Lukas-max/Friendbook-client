import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class AuthorizationInterceptor implements HttpInterceptor {

    constructor(private authenticationService: AuthenticationService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authenticationService.getJwtToken();
        const user = this.authenticationService.getLoggedUserId();

        if (token && user) {
            req = req.clone({
                headers: req.headers.append('Authorization', 'Bearer ' + token)
            });
        };

        return next.handle(req);
    }

}