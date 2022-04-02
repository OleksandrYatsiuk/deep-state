import { HttpParams } from '@angular/common/http';

export function convertToQueries<T>(params: HttpParams, query?: T): HttpParams {
    Object.entries(query || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            params = params.append(String(key), value as any);
        }
    });
    return params;
}
