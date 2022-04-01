import { Inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { CreateTerritory, Territory, UpdateTerritory } from "../interfaces/territory.interface";

@Injectable({ providedIn: 'root' })
export class TerritoryService {
    private _apiUrl = environment.apiUrl;
    private _path = `${this._apiUrl}/territory`;
    constructor(@Inject(HttpClient) private _http: HttpClient) {
    }

    queryCreateTerritory(body: CreateTerritory): Observable<Territory> {
        return this._http.post<Territory>(this._path, body);
    }

    queryUpdateTerritory(id: string, body: UpdateTerritory): Observable<Territory> {
        return this._http.patch<Territory>(`${this._path}/${id}`, body);
    }

    queryTerritoryDelete(id: string): Observable<void> {
        return this._http.delete<void>(`${this._path}/${id}`);
    }

    queryTerritories(): Observable<Territory[]> {
        return this._http.get<Territory[]>(this._path);
    }

    queryTerritory(id: string): Observable<Territory> {
        return this._http.get<Territory>(`${this._path}/${id}`);
    }


}