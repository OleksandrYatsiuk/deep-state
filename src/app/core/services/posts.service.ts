

import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { UpdateTerritory } from '../interfaces/territory.interface';
import { CreatePost, Post } from '../interfaces/post.interface';

@Injectable({ providedIn: 'root' })
export class PostsService {
    private _apiUrl = environment.apiUrl;
    private _path = `${this._apiUrl}/posts`;
    constructor(@Inject(HttpClient) private _http: HttpClient) {
    }

    queryCreatePost(territoryId: string, body: CreatePost): Observable<Post> {
        return this._http.post<Post>(`${this._path}/${territoryId}`, body);
    }

    queryUpdatePost(id: string, body: UpdateTerritory): Observable<Post> {
        return this._http.patch<Post>(`${this._path}/${id}`, body);
    }

    queryPostDelete(id: string): Observable<void> {
        return this._http.delete<void>(`${this._path}/${id}`);
    }

    queryPosts(territoryId: string): Observable<Post[]> {
        return this._http.get<Post[]>(`${this._path}/${territoryId}`);
    }

    queryAllPosts(): Observable<Post[]> {
        return this._http.get<Post[]>(this._path);
    }

    queryPost(id: string): Observable<Post> {
        return this._http.get<Post>(`${this._path}/${id}`);
    }


}