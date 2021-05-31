import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserResponseDto } from '../model/account/userResponseDto';
import { UserData } from '../model/account/userData';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    chosenUser: Subject<UserData> = new Subject<UserData>();

    constructor(private http: HttpClient) { }

    getActiveUsers(): Observable<UserResponseDto[]> {
        return this.http.get<UserResponseDto[]>(`${environment.backendUrl}/api/user`);
    }

    getUserByUUID(uuid: string): Observable<UserResponseDto> {
        return this.http.get<UserResponseDto>(`${environment.backendUrl}/api/user/${uuid}`)
    }
}