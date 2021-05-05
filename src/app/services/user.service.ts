import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { UserResponseDto } from '../model/userResponseDto';
import { UserData } from '../model/userData';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    chosenUser: Subject<UserData> = new Subject<UserData>();

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<UserResponseDto[]> {
        return this.http.get<UserResponseDto[]>(`http://localhost:9010/api/user`);
    }

    getUserByUUID(uuid: string): Observable<UserResponseDto> {
        return this.http.get<UserResponseDto>(`http://localhost:9010/api/user/${uuid}`)
    }
}