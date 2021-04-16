import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from '../model/userDto';
import { filter } from 'rxjs/operators';
import { UserResponseDto } from '../model/userResponseDto';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<UserResponseDto[]> {
        return this.http.get<UserResponseDto[]>(`http://localhost:9010/api/user`);
    }

    getUserByUUID(uuid: string): Observable<UserResponseDto> {
        return this.http.get<UserResponseDto>(`http://localhost:9010/api/user/${uuid}`)
    }
}