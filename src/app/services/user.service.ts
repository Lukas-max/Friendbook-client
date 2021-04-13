import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../model/userDto';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<UserDto[]> {
        return this.http.get<UserDto[]>(`http://localhost:9010/api/user`);
    }

    getUserByUUID(uuid: string): Observable<UserDto> {
        return this.http.get<UserDto>(`http://localhost:9010/api/user/${uuid}`)
    }
}