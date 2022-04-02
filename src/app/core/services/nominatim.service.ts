import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { convertToQueries } from 'src/app/utils/query-params/query-params.utils';
import { environment } from 'src/environments/environment';
import { QuerySearch } from '../interfaces/nominatim.interface';

@Injectable({
  providedIn: 'root'
})
export class NominatimService {
  private _path = environment.mapUrl;
  constructor(@Inject(HttpClient) private _http: HttpClient) { }

  querySearch(query: Partial<QuerySearch>): Observable<any> {
    const options = { params: new HttpParams() }
    options.params = convertToQueries(options.params, { ...query, format: 'json' })
    return this._http.get<any>(`${this._path}/search`, options);
  }
}
